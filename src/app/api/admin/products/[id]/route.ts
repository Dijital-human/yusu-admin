import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Product update schema / Məhsul yeniləmə sxemi
const productUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
});

/**
 * GET /api/admin/products/[id]
 * Fetches a specific product for admin management.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response containing the product or an error.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { id: productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
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
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching admin product:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id]
 * Updates a product for admin management.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response indicating success or an error.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await req.json();
    const validatedFields = productUpdateSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: "Validation error / Yoxlama xətası",
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: validatedFields.data,
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
    });

    return NextResponse.json({
      message: "Product updated successfully / Məhsul uğurla yeniləndi",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error updating admin product:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Deletes a product for admin management.
 * Authenticated user must be an ADMIN.
 *
 * @param {NextRequest} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response indicating success or an error.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { id: productId } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      message: "Product deleted successfully / Məhsul uğurla silindi"
    });
  } catch (error) {
    console.error("Error deleting admin product:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
