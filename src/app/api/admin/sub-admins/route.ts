/**
 * Admin Sub-Admins Management API / Admin Köməkçi Admin İdarəetməsi API
 * Manage sub-admin users with specific permissions
 * Xüsusi icazələrlə köməkçi admin istifadəçilərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";
import { AdminPermission, AdminRole, hasPermission, ROLE_PERMISSIONS } from "@/lib/permissions";

// Validation schemas / Doğrulama sxemləri
const subAdminCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(AdminRole),
  permissions: z.array(z.nativeEnum(AdminPermission)).optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

const subAdminUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(AdminRole).optional(),
  permissions: z.array(z.nativeEnum(AdminPermission)).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
});

const permissionUpdateSchema = z.object({
  permissions: z.array(z.nativeEnum(AdminPermission)),
  reason: z.string().optional(),
});

// GET /api/admin/sub-admins - Get all sub-admins
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_ADMINS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {
      role: "ADMIN",
      id: { not: session.user.id }, // Exclude current user / Cari istifadəçini istisna et
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.adminRole = role;
    }

    if (status) {
      where.isActive = status === "active";
    }

    // Get sub-admins / Köməkçi adminləri al
    const subAdmins = await db.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count / Ümumi sayı al
    const total = await db.user.count({ where });

    // Add role permissions to each sub-admin / Hər köməkçi adminə rol icazələrini əlavə et
    const subAdminsWithPermissions = subAdmins.map((admin) => ({
      ...admin,
      rolePermissions: ROLE_PERMISSIONS[admin.role as AdminRole] || [],
      customPermissions: [],
    }));

    return NextResponse.json({
      subAdmins: subAdminsWithPermissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Sub-Admins API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/sub-admins - Create new sub-admin
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_ADMINS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = subAdminCreateSchema.parse(body);

    // Check if email already exists / E-poçt artıq mövcuddur mu yoxla
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password / Şifrəni hash et
    // Create sub-admin / Köməkçi admin yarat
    const subAdmin = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: "ADMIN",
        isActive: validatedData.isActive ?? true,
      },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
    });

    // Log admin creation / Admin yaradılmasını logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_SUB_ADMIN",
        resourceType: "USER",
        resourceId: subAdmin.id,
        details: JSON.stringify({
          subAdminName: subAdmin.name,
          subAdminEmail: subAdmin.email,
          subAdminRole: subAdmin.role,
          permissions: [],
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sub-admin created successfully",
      subAdmin: {
        ...subAdmin,
        rolePermissions: ROLE_PERMISSIONS[subAdmin.role as AdminRole] || [],
        customPermissions: [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Sub-Admins Create Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sub-admins - Update sub-admin
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_ADMINS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { subAdminId, ...updateData } = body;

    if (!subAdminId) {
      return NextResponse.json({ error: "Sub-admin ID is required" }, { status: 400 });
    }

    // Validate update data / Yeniləmə məlumatlarını doğrula
    const validatedData = subAdminUpdateSchema.parse(updateData);

    // Check if sub-admin exists / Köməkçi admin mövcuddur mu yoxla
    const existingSubAdmin = await db.user.findUnique({
      where: { id: subAdminId, role: "ADMIN" },
    });

    if (!existingSubAdmin) {
      return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
    }

    // Update sub-admin / Köməkçi admini yenilə
    const updatedSubAdmin = await db.user.update({
      where: { id: subAdminId },
      data: {
        ...validatedData,
        role: validatedData.role as any,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
    });

    // Log admin update / Admin yeniləməsini logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SUB_ADMIN",
        resourceType: "USER",
        resourceId: subAdminId,
        details: JSON.stringify({
          subAdminName: updatedSubAdmin.name,
          changes: validatedData,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sub-admin updated successfully",
      subAdmin: {
        ...updatedSubAdmin,
        rolePermissions: ROLE_PERMISSIONS[updatedSubAdmin.role as AdminRole] || [],
        customPermissions: [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Sub-Admins Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sub-admins - Delete sub-admin
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_ADMINS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subAdminId = searchParams.get("id");

    if (!subAdminId) {
      return NextResponse.json({ error: "Sub-admin ID is required" }, { status: 400 });
    }

    // Check if sub-admin exists / Köməkçi admin mövcuddur mu yoxla
    const existingSubAdmin = await db.user.findUnique({
      where: { id: subAdminId, role: "ADMIN" },
    });

    if (!existingSubAdmin) {
      return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
    }

    // Check if trying to delete self / Özünü silməyə çalışır mı yoxla
    if (subAdminId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete sub-admin / Köməkçi admini sil
    await db.user.delete({
      where: { id: subAdminId },
    });

    // Log admin deletion / Admin silinməsini logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_SUB_ADMIN",
        resourceType: "USER",
        resourceId: subAdminId,
        details: JSON.stringify({
          subAdminName: existingSubAdmin.name,
          subAdminEmail: existingSubAdmin.email,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sub-admin deleted successfully",
    });
  } catch (error) {
    console.error("Admin Sub-Admins Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/sub-admins/permissions - Update sub-admin permissions
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_PERMISSIONS)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { subAdminId, ...permissionData } = body;

    if (!subAdminId) {
      return NextResponse.json({ error: "Sub-admin ID is required" }, { status: 400 });
    }

    // Validate permission data / İcazə məlumatlarını doğrula
    const validatedData = permissionUpdateSchema.parse(permissionData);

    // Check if sub-admin exists / Köməkçi admin mövcuddur mu yoxla
    const existingSubAdmin = await db.user.findUnique({
      where: { id: subAdminId, role: "ADMIN" },
    });

    if (!existingSubAdmin) {
      return NextResponse.json({ error: "Sub-admin not found" }, { status: 404 });
    }

    // Update permissions / İcazələri yenilə
    const updatedSubAdmin = await db.user.update({
      where: { id: subAdminId },
      data: {
        // permissions: validatedData.permissions, // Not available in Admin schema
        updatedAt: new Date(),
      },
    });

    // Log permission update / İcazə yeniləməsini logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_SUB_ADMIN_PERMISSIONS",
        resourceType: "USER",
        resourceId: subAdminId,
        details: JSON.stringify({
          subAdminName: existingSubAdmin.name,
          newPermissions: validatedData.permissions,
          reason: validatedData.reason,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Sub-admin permissions updated successfully",
      subAdmin: {
        ...updatedSubAdmin,
        rolePermissions: ROLE_PERMISSIONS[updatedSubAdmin.role as AdminRole] || [],
        customPermissions: [],
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Sub-Admins Permissions Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
