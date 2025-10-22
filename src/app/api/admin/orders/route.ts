/**
 * Admin Orders API / Admin Sifarişlər API
 * API for admin to manage all orders
 * Admin üçün bütün sifarişləri idarə etmək üçün API
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch orders with related data / Əlaqəli məlumatlarla sifarişləri gətir
    const orders = await prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        courier: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              }
            }
          }
        },
        address: true,
      }
    });

    // Get total count / Ümumi sayı gətir
    const total = await prisma.order.count({ where });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin orders API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders / Sifarişləri gətirmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, courierId } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order ID and status are required / Sifariş ID və status tələb olunur' 
        },
        { status: 400 }
      );
    }

    // Update order / Sifarişi yenilə
    const updateData: any = { status };
    if (courierId) {
      updateData.courierId = courierId;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        courier: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              }
            }
          }
        },
        address: true,
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update order / Sifarişi yeniləmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Order ID is required / Sifariş ID tələb olunur' 
        },
        { status: 400 }
      );
    }

    // Delete order and related data / Sifarişi və əlaqəli məlumatları sil
    await prisma.$transaction(async (tx) => {
      // Delete order items first / Əvvəlcə sifariş elementlərini sil
      await tx.orderItem.deleteMany({
        where: { orderId }
      });

      // Delete order / Sifarişi sil
      await tx.order.delete({
        where: { id: orderId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully / Sifariş uğurla silindi'
    });

  } catch (error) {
    console.error('Admin order delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete order / Sifarişi silmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}
