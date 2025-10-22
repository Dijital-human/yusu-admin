import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * GET /api/admin/products
 * Fetches all products for admin management.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing all products or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Ensure price is a number for frontend
    const productsWithNumberPrice = products.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    }));

    // Get total count for pagination
    const totalCount = await prisma.product.count();

    return NextResponse.json({
      products: productsWithNumberPrice,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ 
      error: "Internal server error / Daxili server xətası",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}