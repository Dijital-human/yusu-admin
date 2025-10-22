/**
 * Admin Categories Management API / Admin Kateqoriya İdarəetməsi API
 * Complete control over product categories
 * Məhsul kateqoriyaları üzərində tam nəzarət
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";
import { AdminPermission, hasPermission } from "@/lib/permissions";

// Validation schemas / Doğrulama sxemləri
const categoryCreateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// GET /api/admin/categories - Get all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_CATEGORIES)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const parentId = searchParams.get("parentId") || "";
    const includeProducts = searchParams.get("includeProducts") === "true";

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.isActive = status === "active";
    }

    if (parentId) {
      where.parentId = parentId;
    }

    // Get categories / Kateqoriyaları al
    const categories = await db.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            isActive: true,
            _count: {
              select: {
                products: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        ...(includeProducts && {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              isActive: true,
              seller: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            take: 10,
          },
        }),
      },
      orderBy: [
        { name: "asc" },
      ],
    });

    // Get total count / Ümumi sayı al
    const total = await db.category.count({ where });

    // Build hierarchy / İyerarxiya qur
    const buildHierarchy = (categories: any[], parentId: string | null = null): any[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildHierarchy(categories, cat.id),
        }));
    };

    const hierarchy = buildHierarchy(categories);

    return NextResponse.json({
      categories: hierarchy,
      flatCategories: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Categories API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_CATEGORIES)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = categoryCreateSchema.parse(body);

    // Check if category name already exists / Kateqoriya adı artıq mövcuddur mu yoxla
    const existingCategory = await db.category.findFirst({
      where: {
        name: { equals: validatedData.name },
        parentId: validatedData.parentId || null,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name already exists in the same parent" },
        { status: 400 }
      );
    }

    // Validate parent category if provided / Valide et ana kateqoriya təmin edilirsə
    if (validatedData.parentId) {
      const parentCategory = await db.category.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentCategory) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }

      if (!parentCategory.isActive) {
        return NextResponse.json(
          { error: "Cannot create subcategory under inactive parent" },
          { status: 400 }
        );
      }
    }

    // Create category / Kateqoriya yarat
    const category = await db.category.create({
      data: {
        ...validatedData,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    // Log category creation / Kateqoriya yaradılmasını logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_CATEGORY",
        resourceType: "CATEGORY",
        resourceId: category.id,
        details: JSON.stringify({
          categoryName: category.name,
          parentId: category.parentId,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Categories Create Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/categories - Update category
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_CATEGORIES)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { categoryId, ...updateData } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Validate update data / Yeniləmə məlumatlarını doğrula
    const validatedData = categoryUpdateSchema.parse(updateData);

    // Check if category exists / Kateqoriya mövcuddur mu yoxla
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if new name conflicts / Yeni ad konflikt yaradır mı yoxla
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const conflictingCategory = await db.category.findFirst({
        where: {
          name: { equals: validatedData.name },
          parentId: validatedData.parentId !== undefined ? validatedData.parentId : existingCategory.parentId,
          id: { not: categoryId },
        },
      });

      if (conflictingCategory) {
        return NextResponse.json(
          { error: "Category with this name already exists in the same parent" },
          { status: 400 }
        );
      }
    }

    // Validate parent category if changing / Dəyişdirilirsə ana kateqoriyanı valide et
    if (validatedData.parentId !== undefined && validatedData.parentId !== existingCategory.parentId) {
      if (validatedData.parentId) {
        const parentCategory = await db.category.findUnique({
          where: { id: validatedData.parentId },
        });

        if (!parentCategory) {
          return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
        }

        if (!parentCategory.isActive) {
          return NextResponse.json(
            { error: "Cannot move category under inactive parent" },
            { status: 400 }
          );
        }

        // Check for circular reference / Dairəvi istinadı yoxla
        if (validatedData.parentId === categoryId) {
          return NextResponse.json(
            { error: "Category cannot be its own parent" },
            { status: 400 }
          );
        }
      }
    }

    // Update category / Kateqoriyanı yenilə
    const updatedCategory = await db.category.update({
      where: { id: categoryId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    // Log category update / Kateqoriya yeniləməsini logla
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_CATEGORY",
        resourceType: "CATEGORY",
        resourceId: categoryId,
        details: JSON.stringify({
          categoryName: updatedCategory.name,
          changes: validatedData,
        }),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Categories Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check permissions / İcazələri yoxla
    if (!hasPermission(session.user.role as any, AdminPermission.MANAGE_CATEGORIES)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!categoryId) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category exists / Kateqoriya mövcuddur mu yoxla
    const existingCategory = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has products or subcategories / Kateqoriyanın məhsulları və ya alt kateqoriyaları var mı yoxla
    if (!force && (existingCategory._count.products > 0 || existingCategory._count.children > 0)) {
      return NextResponse.json(
        {
          error: "Category has products or subcategories",
          details: {
            productsCount: existingCategory._count.products,
            childrenCount: existingCategory._count.children,
          },
        },
        { status: 400 }
      );
    }

    // If force delete, move products to parent or root / Məcburi silmə, məhsulları ana və ya kökə köçür
    if (force && existingCategory._count.products > 0) {
      const targetParentId = existingCategory.parentId;
      
      if (targetParentId) {
        await db.product.updateMany({
          where: { categoryId: categoryId },
          data: { categoryId: targetParentId },
        });
      } else {
        // If no parent, set to undefined (uncategorized)
        await db.product.updateMany({
          where: { categoryId: categoryId },
          data: { categoryId: undefined },
        });
      }
    }

    // If force delete, move subcategories to parent / Məcburi silmə, alt kateqoriyaları ana kateqoriyaya köçür
    if (force && existingCategory._count.children > 0) {
      await db.category.updateMany({
        where: { parentId: categoryId },
        data: { parentId: existingCategory.parentId },
      });
    }

    // Delete category / Kateqoriyanı sil
    await db.category.delete({
      where: { id: categoryId },
    });

    // Log category deletion / Kateqoriya silinməsini logla
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_CATEGORY",
          resourceType: "CATEGORY",
          resourceId: categoryId,
          details: JSON.stringify({
            categoryName: existingCategory.name,
            forceDelete: force,
          }),
          createdAt: new Date(),
        },
      });

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Admin Categories Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
