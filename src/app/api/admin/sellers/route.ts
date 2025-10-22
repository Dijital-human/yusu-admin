/**
 * Admin Sellers Management API / Admin Satıcı İdarəetməsi API
 * Manage sellers, their permissions, and analytics
 * Satıcıları, onların icazələrini və analitikasını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas / Doğrulama sxemləri
const sellerUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const sellerPermissionSchema = z.object({
  canSell: z.boolean(),
  canManageProducts: z.boolean(),
  canViewAnalytics: z.boolean(),
  canManageOrders: z.boolean(),
  allowedCategories: z.array(z.string()).optional(),
  maxProducts: z.number().optional(),
  commissionRate: z.number().min(0).max(100),
});

// GET /api/admin/sellers - Get all sellers with analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {
      role: "SELLER",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.isActive = status === "active";
    }

    // Get sellers with analytics / Satıcıları analitika ilə al
    const sellers = await db.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            categoryId: true,
            isActive: true,
            createdAt: true,
            _count: {
              select: {
                orderItems: true,
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count / Ümumi sayı al
    const total = await db.user.count({ where });

    // Calculate analytics for each seller / Hər satıcı üçün analitika hesabla
    const sellersWithAnalytics = await Promise.all(
      sellers.map(async (seller) => {
        // Get category-wise product counts / Kateqoriya üzrə məhsul sayları
        const categoryStats = await db.product.groupBy({
          by: ["categoryId"],
          where: { sellerId: seller.id },
          _count: { id: true },
        });

        // Get monthly revenue / Aylıq gəlir
        const monthlyRevenue = await db.order.aggregate({
          where: {
            sellerId: seller.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get weekly revenue / Həftəlik gəlir
        const weeklyRevenue = await db.order.aggregate({
          where: {
            sellerId: seller.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get daily revenue / Günlük gəlir
        const dailyRevenue = await db.order.aggregate({
          where: {
            sellerId: seller.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get top selling products / Ən çox satılan məhsullar
        const topProducts = await db.product.findMany({
          where: { sellerId: seller.id },
          include: {
            _count: {
              select: { orderItems: true },
            },
          },
          orderBy: {
            orderItems: { _count: "desc" },
          },
          take: 5,
        });

        return {
          ...seller,
          analytics: {
            totalProducts: seller._count.products,
            totalOrders: seller._count.orders,
            monthlyRevenue: monthlyRevenue._sum.totalAmount || 0,
            weeklyRevenue: weeklyRevenue._sum.totalAmount || 0,
            dailyRevenue: dailyRevenue._sum.totalAmount || 0,
            categoryStats: categoryStats.map((stat) => ({
              categoryId: stat.categoryId,
              productCount: stat._count.id,
            })),
            topProducts: topProducts.map((product) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              salesCount: product._count.orderItems,
            })),
          },
        };
      })
    );

    return NextResponse.json({
      sellers: sellersWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Sellers API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/sellers - Update seller permissions and status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sellerId, ...updateData } = body;

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    // Validate update data / Yeniləmə məlumatlarını doğrula
    const validatedData = sellerUpdateSchema.parse(updateData);

    // Update seller / Satıcını yenilə
    const updatedSeller = await db.user.update({
      where: { id: sellerId, role: "SELLER" },
      data: validatedData,
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            categoryId: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Seller updated successfully",
      seller: updatedSeller,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Sellers Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/sellers - Delete seller
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("id");

    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }

    // Check if seller has active products or orders / Satıcının aktiv məhsulları və ya sifarişləri var mı yoxla
    const seller = await db.user.findUnique({
      where: { id: sellerId, role: "SELLER" },
      include: {
        products: { where: { isActive: true } },
        orders: { where: { status: { not: "CANCELLED" } } },
      },
    });

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (seller.products.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete seller with active products" },
        { status: 400 }
      );
    }

    if (seller.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete seller with active orders" },
        { status: 400 }
      );
    }

    // Delete seller / Satıcını sil
    await db.user.delete({
      where: { id: sellerId },
    });

    return NextResponse.json({
      message: "Seller deleted successfully",
    });
  } catch (error) {
    console.error("Admin Sellers Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
