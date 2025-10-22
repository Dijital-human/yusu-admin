/**
 * Admin Couriers Management API / Admin Kuryer İdarəetməsi API
 * Manage couriers, their permissions, and analytics
 * Kuryerləri, onların icazələrini və analitikasını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas / Doğrulama sxemləri
const courierUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  vehicleType: z.string().optional(),
  licenseNumber: z.string().optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

const courierPermissionSchema = z.object({
  canDeliver: z.boolean(),
  canViewOrders: z.boolean(),
  canUpdateStatus: z.boolean(),
  allowedZones: z.array(z.string()).optional(),
  maxDeliveriesPerDay: z.number().optional(),
  commissionRate: z.number().min(0).max(100),
});

// GET /api/admin/couriers - Get all couriers with analytics
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
    const vehicleType = searchParams.get("vehicleType") || "";

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {
      role: "COURIER",
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

    if (vehicleType) {
      where.vehicleType = vehicleType;
    }

    // Get couriers with analytics / Kuryerləri analitika ilə al
    const couriers = await db.user.findMany({
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
            shippingAddress: true,
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get total count / Ümumi sayı al
    const total = await db.user.count({ where });

    // Calculate analytics for each courier / Hər kuryer üçün analitika hesabla
    const couriersWithAnalytics = await Promise.all(
      couriers.map(async (courier) => {
        // Get delivery statistics / Çatdırılma statistikaları
        const deliveryStats = await db.order.groupBy({
          by: ["status"],
          where: { courierId: courier.id },
          _count: { id: true },
        });

        // Get monthly earnings / Aylıq qazanc
        const monthlyEarnings = await db.order.aggregate({
          where: {
            courierId: courier.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get weekly earnings / Həftəlik qazanc
        const weeklyEarnings = await db.order.aggregate({
          where: {
            courierId: courier.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get daily earnings / Günlük qazanc
        const dailyEarnings = await db.order.aggregate({
          where: {
            courierId: courier.id,
            status: "DELIVERED",
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
          _sum: { totalAmount: true },
        });

        // Get recent deliveries / Son çatdırılmalar
        const recentDeliveries = await db.order.findMany({
          where: { courierId: courier.id },
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                    price: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        // Calculate average delivery time / Orta çatdırılma vaxtını hesabla
        const completedOrders = await db.order.findMany({
          where: {
            courierId: courier.id,
            status: "DELIVERED",
          },
          select: {
            createdAt: true,
            updatedAt: true,
          },
        });

        const avgDeliveryTime = completedOrders.length > 0
          ? completedOrders.reduce((acc, order) => {
              const deliveryTime = order.updatedAt.getTime() - order.createdAt.getTime();
              return acc + deliveryTime;
            }, 0) / completedOrders.length
          : 0;

        return {
          ...courier,
          analytics: {
            totalDeliveries: courier._count.orders,
            completedDeliveries: deliveryStats.find(s => s.status === "DELIVERED")?._count.id || 0,
            pendingDeliveries: deliveryStats.find(s => s.status === "PENDING")?._count.id || 0,
            monthlyEarnings: monthlyEarnings._sum.totalAmount || 0,
            weeklyEarnings: weeklyEarnings._sum.totalAmount || 0,
            dailyEarnings: dailyEarnings._sum.totalAmount || 0,
            averageDeliveryTime: Math.round(avgDeliveryTime / (1000 * 60 * 60)), // hours
            deliveryStats: deliveryStats.map((stat) => ({
              status: stat.status,
              count: stat._count.id,
            })),
            recentDeliveries: recentDeliveries.map((delivery) => ({
              id: delivery.id,
              customerName: delivery.customer.name,
              customerPhone: delivery.customer.phone,
              address: delivery.shippingAddress,
              status: delivery.status,
              totalAmount: delivery.totalAmount,
              createdAt: delivery.createdAt,
              items: delivery.items.map((item) => ({
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
              })),
            })),
          },
        };
      })
    );

    return NextResponse.json({
      couriers: couriersWithAnalytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Couriers API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/couriers - Update courier permissions and status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courierId, ...updateData } = body;

    if (!courierId) {
      return NextResponse.json({ error: "Courier ID is required" }, { status: 400 });
    }

    // Validate update data / Yeniləmə məlumatlarını doğrula
    const validatedData = courierUpdateSchema.parse(updateData);

    // Update courier / Kuryeri yenilə
    const updatedCourier = await db.user.update({
      where: { id: courierId, role: "COURIER" },
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
          },
        },
      },
    });

    return NextResponse.json({
      message: "Courier updated successfully",
      courier: updatedCourier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Admin Couriers Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/couriers - Delete courier
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courierId = searchParams.get("id");

    if (!courierId) {
      return NextResponse.json({ error: "Courier ID is required" }, { status: 400 });
    }

    // Check if courier has active orders / Kuryerin aktiv sifarişləri var mı yoxla
    const courier = await db.user.findUnique({
      where: { id: courierId, role: "COURIER" },
      include: {
        orders: { where: { status: { not: "CANCELLED" } } },
      },
    });

    if (!courier) {
      return NextResponse.json({ error: "Courier not found" }, { status: 404 });
    }

    if (courier.orders.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete courier with active orders" },
        { status: 400 }
      );
    }

    // Delete courier / Kuryeri sil
    await db.user.delete({
      where: { id: courierId },
    });

    return NextResponse.json({
      message: "Courier deleted successfully",
    });
  } catch (error) {
    console.error("Admin Couriers Delete Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
