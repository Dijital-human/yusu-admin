import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Find the product
    const product = await db.product.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }


    // Reject the product (unpublish it)
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        updatedAt: new Date()
      },
      include: {
        seller: true,
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Product rejected successfully / Məhsul uğurla rədd edildi",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Error rejecting product:", error);
    return NextResponse.json(
      { error: "Internal server error / Server xətası" },
      { status: 500 }
    );
  }
}
