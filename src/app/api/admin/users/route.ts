/**
 * Admin Users API / Admin İstifadəçilər API
 * API for admin to manage all users
 * Admin üçün bütün istifadəçiləri idarə etmək üçün API
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch users / İstifadəçiləri gətir
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            products: true,
            reviews: true,
          }
        }
      }
    });

    // Get total count / Ümumi sayı gətir
    const total = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users / İstifadəçiləri gətirmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, role, phone, isActive } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required / İstifadəçi ID tələb olunur' 
        },
        { status: 400 }
      );
    }

    // Update user / İstifadəçini yenilə
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(phone && { phone }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            products: true,
            reviews: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update user / İstifadəçini yeniləmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required / İstifadəçi ID tələb olunur' 
        },
        { status: 400 }
      );
    }

    // Check if user has orders or products / İstifadəçinin sifariş və ya məhsulu olub-olmadığını yoxla
    const userOrders = await prisma.order.count({
      where: {
        OR: [
          { customerId: userId },
          { sellerId: userId },
          { courierId: userId }
        ]
      }
    });

    const userProducts = await prisma.product.count({
      where: { sellerId: userId }
    });

    if (userOrders > 0 || userProducts > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete user with existing orders or products / Sifariş və ya məhsulu olan istifadəçini silmək olmaz' 
        },
        { status: 400 }
      );
    }

    // Delete user and related data / İstifadəçini və əlaqəli məlumatları sil
    await prisma.$transaction(async (tx) => {
      // Delete user's addresses / İstifadəçinin ünvanlarını sil
      await tx.address.deleteMany({
        where: { userId }
      });

      // Delete user's cart items / İstifadəçinin səbət elementlərini sil
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      // Delete user's reviews / İstifadəçinin rəylərini sil
      await tx.review.deleteMany({
        where: { userId }
      });

      // Delete user's accounts and sessions / İstifadəçinin hesablarını və sessiyalarını sil
      await tx.account.deleteMany({
        where: { userId }
      });

      await tx.session.deleteMany({
        where: { userId }
      });

      // Delete user / İstifadəçini sil
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully / İstifadəçi uğurla silindi'
    });

  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete user / İstifadəçini silmək uğursuz oldu' 
      },
      { status: 500 }
    );
  }
}
