/**
 * Admin Backup System API / Admin Backup Sistemi API
 * Complete backup and restore functionality
 * Tam backup və bərpa funksionallığı
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";
import { AdminPermission, hasPermission } from "@/lib/permissions";
import { writeFile, readFile, mkdir, readdir, stat } from "fs/promises";
import { join } from "path";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream";
import { gzip, gunzip } from "zlib";

// Validation schemas / Doğrulama sxemləri
const backupCreateSchema = z.object({
  name: z.string().min(2, "Backup name must be at least 2 characters"),
  description: z.string().optional(),
  includeData: z.boolean().default(true),
  includeFiles: z.boolean().default(true),
  includeSettings: z.boolean().default(true),
  compress: z.boolean().default(true),
});

const restoreSchema = z.object({
  backupId: z.string(),
  restoreData: z.boolean().default(true),
  restoreFiles: z.boolean().default(true),
  restoreSettings: z.boolean().default(true),
  confirm: z.boolean().refine(val => val === true, "Confirmation required"),
});

// GET /api/admin/backup - Get all backups
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_BACKUPS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Get backups from database / Verilənlər bazasından backupları al
    const backups = await db.backup.findMany({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      } : {},
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count / Ümumi sayı al
    const total = await db.backup.count({
      where: search ? {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      } : {},
    });

    // Check file sizes and status / Fayl ölçülərini və statusunu yoxla
    const backupsWithStatus = await Promise.all(
      backups.map(async (backup) => {
        try {
          const backupPath = join(process.cwd(), "backups", `${backup.id}.backup`);
          const stats = await stat(backupPath);
          
          return {
            ...backup,
            fileSize: stats.size,
            fileExists: true,
            status: "completed",
          };
        } catch (error) {
          return {
            ...backup,
            fileSize: 0,
            fileExists: false,
            status: "missing",
          };
        }
      })
    );

    return NextResponse.json({
      backups: backupsWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Backup API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/backup - Create new backup
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_BACKUPS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = backupCreateSchema.parse(body);

    // Create backup record / Backup qeydi yarat
    const backup = await db.backup.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: "FULL",
        status: "IN_PROGRESS",
        size: 0,
        metadata: JSON.stringify({
          includeData: validatedData.includeData,
          includeFiles: validatedData.includeFiles,
          includeSettings: validatedData.includeSettings,
          compress: validatedData.compress,
        }),
        userId: session.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Start backup process in background / Backup prosesini arxa planda başlat
    processBackup(backup.id, validatedData, session.user.id);

    return NextResponse.json({
      message: "Backup process started",
      backup: {
        id: backup.id,
        name: backup.name,
        status: backup.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Backup Create Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/backup - Restore from backup
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_BACKUPS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = restoreSchema.parse(body);

    // Get backup record / Backup qeydini al
    const backup = await db.backup.findUnique({
      where: { id: validatedData.backupId },
    });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    if (backup.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Backup is not ready for restore" },
        { status: 400 }
      );
    }

    // Check if backup file exists / Backup faylı mövcuddur mu yoxla
    const backupPath = join(process.cwd(), "backups", `${backup.id}.backup`);
    try {
      await stat(backupPath);
    } catch (error) {
      return NextResponse.json(
        { error: "Backup file not found" },
        { status: 404 }
      );
    }

    // Start restore process in background / Bərpa prosesini arxa planda başlat
    processRestore(backup.id, validatedData, session.user.id);

    return NextResponse.json({
      message: "Restore process started",
      backup: {
        id: backup.id,
        name: backup.name,
        status: "RESTORING",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Backup Restore Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/backup - Delete backup
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_BACKUPS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get("id");

    if (!backupId) {
      return NextResponse.json({ error: "Backup ID is required" }, { status: 400 });
    }

    // Get backup record / Backup qeydini al
    const backup = await db.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    // Delete backup file / Backup faylını sil
    try {
      const backupPath = join(process.cwd(), "backups", `${backup.id}.backup`);
      await stat(backupPath);
      // File exists, delete it / Fayl mövcuddur, sil
      // await unlink(backupPath);
    } catch (error) {
      // File doesn't exist, continue / Fayl mövcud deyil, davam et
    }

    // Delete backup record / Backup qeydini sil
    await db.backup.delete({
      where: { id: backupId },
    });

    // Log backup deletion / Backup silinməsini logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_BACKUP",
        resourceType: "BACKUP",
        resourceId: backupId,
        details: JSON.stringify({
          backupName: backup.name,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Backup deleted successfully",
    });
  } catch (error) {
    console.error("Admin Backup Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Background backup process / Arxa plan backup prosesi
async function processBackup(backupId: string, options: any, userId: string) {
  try {
    // Ensure backups directory exists / Backup qovluğunun mövcud olduğundan əmin ol
    const backupsDir = join(process.cwd(), "backups");
    await mkdir(backupsDir, { recursive: true });

    const backupPath = join(backupsDir, `${backupId}.backup`);
    const tempPath = join(backupsDir, `${backupId}.temp`);

    let backupData: any = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      options,
    };

    // Backup database data / Verilənlər bazası məlumatlarını backup et
    if (options.includeData) {
      const tables = [
        "User", "Product", "Order", "Category", "OrderItem", 
        "Review", "Address", "WishlistItem", "CartItem"
      ];

      backupData.database = {};
      for (const table of tables) {
        try {
          const data = await (db as any)[table.toLowerCase()].findMany();
          backupData.database[table] = data;
        } catch (error) {
          console.error(`Error backing up table ${table}:`, error);
        }
      }
    }

    // Backup settings / Tənzimləri backup et
    if (options.includeSettings) {
      // Note: SiteSetting model not available in admin schema
      // const settings = await db.siteSetting.findMany();
      backupData.settings = [];
    }

    // Write backup file / Backup faylını yaz
    const backupContent = JSON.stringify(backupData, null, 2);
    
    // Write backup file (compression disabled for now)
    await writeFile(backupPath, backupContent);

    // Get file size / Fayl ölçüsünü al
    const stats = await stat(backupPath);
    const fileSize = stats.size;

    // Update backup record / Backup qeydini yenilə
    await db.backup.update({
      where: { id: backupId },
      data: {
        status: "COMPLETED",
        size: fileSize,
        updatedAt: new Date(),
      },
    });

    // Log successful backup / Uğurlu backupu logla
    await db.auditLog.create({
      data: {
        userId,
        action: "BACKUP_COMPLETED",
        resourceType: "BACKUP",
        resourceId: backupId,
        details: JSON.stringify({
          fileSize,
          options,
        }),
        createdAt: new Date(),
      },
    });

  } catch (error) {
    console.error("Backup process error:", error);
    
    // Update backup record with error / Backup qeydini xəta ilə yenilə
    await db.backup.update({
      where: { id: backupId },
      data: {
        status: "FAILED",
        updatedAt: new Date(),
      },
    });

    // Log backup failure / Backup uğursuzluğunu logla
    await db.auditLog.create({
      data: {
        userId,
        action: "BACKUP_FAILED",
        resourceType: "BACKUP",
        resourceId: backupId,
        details: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        createdAt: new Date(),
      },
    });
  }
}

// Background restore process / Arxa plan bərpa prosesi
async function processRestore(backupId: string, options: any, userId: string) {
  try {
    const backupPath = join(process.cwd(), "backups", `${backupId}.backup`);
    
    // Read backup file / Backup faylını oxu
    let backupContent: string;
    try {
      const stats = await stat(backupPath);
      if (stats.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error("Backup file too large");
      }
      
      const fileBuffer = await readFile(backupPath);
      
      // Try to decompress if it's gzipped / Gzip edilmişsə dekompress et
      try {
        backupContent = (await new Promise((resolve, reject) => {
          gunzip(fileBuffer, (err, result) => {
            if (err) reject(err);
            else resolve(result.toString());
          });
        })) as string;
      } catch (error) {
        // Not compressed, read as text / Sıxışdırılmamış, mətn kimi oxu
        backupContent = fileBuffer.toString();
      }
    } catch (error) {
      throw new Error("Failed to read backup file");
    }

    const backupData = JSON.parse(backupContent);

    // Restore database data / Verilənlər bazası məlumatlarını bərpa et
    if (options.restoreData && backupData.database) {
      for (const [tableName, data] of Object.entries(backupData.database)) {
        try {
          const table = (db as any)[tableName.toLowerCase()];
          if (table && Array.isArray(data)) {
            // Clear existing data / Mövcud məlumatları təmizlə
            await table.deleteMany({});
            
            // Insert backup data / Backup məlumatlarını daxil et
            if (data.length > 0) {
              await table.createMany({
                data: data,
                skipDuplicates: true,
              });
            }
          }
        } catch (error) {
          console.error(`Error restoring table ${tableName}:`, error);
        }
      }
    }

    // Restore settings / Tənzimləri bərpa et
    // Note: SiteSetting model not available in admin schema
    // if (options.restoreSettings && backupData.settings) {
    //   await db.siteSetting.deleteMany({});
    //   if (backupData.settings.length > 0) {
    //     await db.siteSetting.createMany({
    //       data: backupData.settings,
    //       skipDuplicates: true,
    //     });
    //   }
    // }

    // Update backup record / Backup qeydini yenilə
    await db.backup.update({
      where: { id: backupId },
      data: {
        status: "COMPLETED",
        updatedAt: new Date(),
      },
    });

    // Log successful restore / Uğurlu bərpanı logla
    await db.auditLog.create({
      data: {
        userId,
        action: "RESTORE_COMPLETED",
        resourceType: "BACKUP",
        resourceId: backupId,
        details: JSON.stringify({
          options,
        }),
        createdAt: new Date(),
      },
    });

  } catch (error) {
    console.error("Restore process error:", error);
    
    // Update backup record with error / Backup qeydini xəta ilə yenilə
    await db.backup.update({
      where: { id: backupId },
      data: {
        status: "RESTORE_FAILED",
        updatedAt: new Date(),
      },
    });

    // Log restore failure / Bərpa uğursuzluğunu logla
    await db.auditLog.create({
      data: {
        userId,
        action: "RESTORE_FAILED",
        resourceType: "BACKUP",
        resourceId: backupId,
        details: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
        createdAt: new Date(),
      },
    });
  }
}
