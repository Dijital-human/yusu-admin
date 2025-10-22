import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus, UserRole } from "@prisma/client";

/**
 * GET /api/admin/stats
 * Fetches statistics for the admin dashboard.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing admin statistics or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    // Get total users count
    // Ümumi istifadəçi sayını al
    const totalUsers = await prisma.user.count();

    // Get active users count
    // Aktiv istifadəçi sayını al
    const activeUsers = await prisma.user.count({
      where: { isActive: true },
    });

    // Get inactive users count
    // Qeyri-aktiv istifadəçi sayını al
    const inactiveUsers = await prisma.user.count({
      where: { isActive: false },
    });

    // Get total products count
    // Ümumi məhsul sayını al
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // Get total orders count
    // Ümumi sifariş sayını al
    const totalOrders = await prisma.order.count();

    // Get pending orders count
    // Gözləyən sifariş sayını al
    const pendingOrders = await prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });

    // Get completed orders count
    // Tamamlanmış sifariş sayını al
    const completedOrders = await prisma.order.count({
      where: { status: OrderStatus.DELIVERED },
    });

    // Get total revenue
    // Ümumi gəliri al
    const revenueResult = await prisma.order.aggregate({
      where: {
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Calculate growth percentages (placeholder logic)
    // Böyümə faizlərini hesabla (yer tutucu məntiq)
    const userGrowth = 12; // Example percentage / Nümunə faiz
    const orderGrowth = 8;  // Example percentage / Nümunə faiz
    const revenueGrowth = 15; // Example percentage / Nümunə faiz

    return NextResponse.json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      userGrowth,
      orderGrowth,
      revenueGrowth,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}