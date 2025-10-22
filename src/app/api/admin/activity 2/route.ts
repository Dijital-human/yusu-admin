import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/activity
 * Fetches recent activity for the admin dashboard.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing recent activity or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get recent orders
    // Son sifarişləri al
    const recentOrders = await prisma.order.findMany({
      take: Math.floor(limit / 2),
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { name: true, email: true },
        },
      },
    });

    // Get recent users
    // Son istifadəçiləri al
    const recentUsers = await prisma.user.findMany({
      take: Math.floor(limit / 2),
      orderBy: { createdAt: "desc" },
    });

    // Format activities
    // Fəaliyyətləri formatla
    const activities = [
      ...recentOrders.map(order => ({
        id: `order-${order.id}`,
        type: "order",
        description: `New order #${order.id.slice(-8)} placed by ${order.customer?.name || "Unknown"}`,
        timestamp: order.createdAt.toISOString(),
        user: order.customer?.name || "Unknown",
      })),
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: "user",
        description: `New user ${user.name} registered as ${user.role}`,
        timestamp: user.createdAt.toISOString(),
        user: user.name || "Unknown",
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

    return NextResponse.json({
      activities,
    });
  } catch (error) {
    console.error("Error fetching admin activity:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
