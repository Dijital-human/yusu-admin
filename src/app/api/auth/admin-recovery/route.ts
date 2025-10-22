/**
 * Admin Password Recovery API / Admin Parol Bərpası API
 * This file handles admin password recovery
 * Bu fayl admin parol bərpasını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { AdminPasswordRecovery } from '@/lib/auth/admin-password-recovery';
import { SimpleAdminAuth } from '@/lib/auth/simple-admin';

export async function POST(request: NextRequest) {
  try {
    const { recoveryCode, masterKey, newPassword } = await request.json();
    
    // Recovery məlumatlarını yoxla
    if (!AdminPasswordRecovery.validateRecoveryRequest(recoveryCode, masterKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid recovery credentials / Yanlış bərpa məlumatları' },
        { status: 401 }
      );
    }
    
    // Yeni parol yaratmaq (əgər verilməyibsə)
    const finalPassword = newPassword || AdminPasswordRecovery.generateNewPassword();
    
    // Parol yeniləmək
    const updateSuccess = SimpleAdminAuth.updateAdminPassword(finalPassword);
    
    if (!updateSuccess) {
      return NextResponse.json(
        { success: false, error: 'Password update failed / Parol yeniləməsi uğursuz' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password recovered successfully / Parol uğurla bərpa edildi',
      newPassword: finalPassword,
      adminInfo: AdminPasswordRecovery.getAdminInfo()
    });
    
  } catch (error) {
    console.error('Admin recovery error:', error);
    return NextResponse.json(
      { success: false, error: 'Recovery failed / Bərpa uğursuz' },
      { status: 500 }
    );
  }
}

// Recovery məlumatlarını almaq
export async function GET() {
  try {
    const adminInfo = AdminPasswordRecovery.getAdminInfo();
    
    return NextResponse.json({
      success: true,
      data: {
        email: adminInfo.email,
        hasRecoveryCodes: adminInfo.recoveryCodes.length > 0
      }
    });
    
  } catch (error) {
    console.error('Get recovery info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recovery info / Bərpa məlumatları alına bilmədi' },
      { status: 500 }
    );
  }
}
