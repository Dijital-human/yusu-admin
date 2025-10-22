/**
 * Admin Login API Route / Admin Girişi API Route-u
 * This file handles admin authentication
 * Bu fayl admin autentifikasiyasını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { SimpleAdminAuth } from '@/lib/auth/simple-admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Admin girişini yoxla
    if (!SimpleAdminAuth.verifyAdmin(email, password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials / Yanlış admin məlumatları' },
        { status: 401 }
      );
    }
    
    // Admin məlumatları
    const adminData = {
      id: 'admin-001',
      email: email,
      role: 'ADMIN',
      isAdmin: true,
      loginTime: new Date().toISOString()
    };
    
    // Admin token yarat
    const token = SimpleAdminAuth.generateAdminToken(adminData);
    
    // Response
    const response = NextResponse.json({
      success: true,
      message: 'Admin login successful / Admin girişi uğurlu',
      admin: {
        id: adminData.id,
        email: adminData.email,
        role: adminData.role
      }
    });
    
    // Cookie-yə yaz
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 saat
    });
    
    return response;
    
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed / Giriş uğursuz' },
      { status: 500 }
    );
  }
}
