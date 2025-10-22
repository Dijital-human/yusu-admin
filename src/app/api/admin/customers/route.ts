/**
 * Admin Customers Management API / Admin Müştəri İdarəetməsi API
 * Manage customers, their behavior, and analytics
 * Müştəriləri, onların davranışını və analitikasını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas / Doğrulama sxemləri
const customerUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// GET /api/admin/customers - Get all customers with analytics
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {
      role: "CUSTOMER",
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

    // Build order by / Sıralama qur
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get customers with analytics / Müştəriləri analitika ilə al
    const customers = await db.user.findMany({
      where,
      skip,
      take: limit,
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    categoryId: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            productId: true,
            createdAt: true,
            product: {
              select: {
                name: true,
                categoryId: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy,
    });

    // Get total count / Ümumi sayı al
    const total = await db.user.count({ where });

    // Calculate analytics for each customer / Hər müştəri üçün analitika hesabla
    const customersWithAnalytics = await Promise.all(
      customers.map(async (customer) => {
        // Get purchase history / Alış tarixçəsi
        const purchaseHistory = customer.orders.map((order) => ({
          id: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            productName: item.product.name,
            categoryId: item.product.categoryId,
            quantity: item.quantity,
          })),
        }));

        // Get favorite categories / Sevimli kateqoriyalar
        const categoryPreferences = await db.orderItem.groupBy({
          by: ["productId"],
          where: {
            order: {
              customerId: customer.id,
            },
          },
          _count: { id: true },
          _sum: { quantity: true },
        });

        // Get search behavior (if we had search logs) / Axtarış davranışı
        const searchBehavior = {
          mostSearchedCategories: [], // Would come from search logs
          mostViewedProducts: [], // Would come from view logs
          averageSessionTime: 0, // Would come from analytics
        };

        // Get wishlist items / İstək siyahısı məhsulları
        // Note: WishlistItem model is not available in admin schema
        const wishlistItems: any[] = [];

        // Get review behavior / Rəy davranışı
        const reviewBehavior = {
          totalReviews: customer._count.reviews,
          averageRating: customer.reviews.length > 0
            ? customer.reviews.reduce((acc, review) => acc + review.rating, 0) / customer.reviews.length
            : 0,
          mostReviewedCategories: customer.reviews.reduce((acc, review) => {
            const categoryId = review.product.categoryId;
            acc[categoryId] = (acc[categoryId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };

        // Get spending patterns / Xərcləmə nümunələri
        const spendingPatterns = {
          totalSpent: customer.orders.reduce((acc, order) => acc + Number(order.totalAmount), 0),
          averageOrderValue: customer.orders.length > 0
            ? customer.orders.reduce((acc, order) => acc + Number(order.totalAmount), 0) / customer.orders.length
            : 0,
          monthlySpending: customer.orders.reduce((acc, order) => {
            const month = order.createdAt.toISOString().slice(0, 7);
            acc[month] = (acc[month] || 0) + Number(order.totalAmount);
            return acc;
          }, {} as Record<string, number>),
        };

        // Get customer lifetime value / Müştəri həyat dəyəri
        const customerLifetimeValue = {
          totalOrders: customer._count.orders,
          totalSpent: spendingPatterns.totalSpent,
          averageOrderValue: spendingPatterns.averageOrderValue,
          lastOrderDate: customer.orders.length > 0
            ? customer.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
            : null,
          daysSinceLastOrder: customer.orders.length > 0
            ? Math.floor((Date.now() - customer.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : null,
        };

        return {
          ...customer,
          analytics: {
            purchaseHistory,
            categoryPreferences: categoryPreferences.map((pref) => ({
              categoryId: pref.productId,
              orderCount: pref._count.id,
              totalQuantity: pref._sum.quantity || 0,
            })),
            searchBehavior,
            wishlistItems: wishlistItems.map((item) => ({
              id: item.id,
              product: item.product,
              addedAt: item.createdAt,
            })),
            reviewBehavior,
            spendingPatterns,
            customerLifetimeValue,
          },
        };
      })
    );

    return NextResponse.json({
      customers: customersWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Customers API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/customers - Update customer status and notes
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, ...updateData } = body;

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Validate update data / Yeniləmə məlumatlarını doğrula
    const validatedData = customerUpdateSchema.parse(updateData);

    // Update customer / Müştərini yenilə
    const updatedCustomer = await db.user.update({
      where: { id: customerId, role: "CUSTOMER" },
      data: validatedData,
      include: {
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
            orders: true,
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Customer updated successfully",
      customer: updatedCustomer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Customers Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/customers - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("id");

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    // Check if customer has active orders / Müştərinin aktiv sifarişləri var mı yoxla
    const customer = await db.user.findUnique({
      where: { id: customerId, role: "CUSTOMER" },
      include: {
        orders: { where: { status: { not: "CANCELLED" } } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    if (customer.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete customer with active orders" },
        { status: 400 }
      );
    }

    // Delete customer / Müştərini sil
    await db.user.delete({
      where: { id: customerId },
    });

    return NextResponse.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Admin Customers Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
