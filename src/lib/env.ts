/**
 * Admin Environment Variables Validation / Admin Mühit Dəyişənləri Doğrulama
 * This utility validates and provides type-safe access to admin environment variables
 * Bu utility admin environment variables-ları doğrulayır və type-safe giriş təmin edir
 */

import { z } from "zod";

// Admin environment schema definition / Admin mühit şeması tərifi
const adminEnvSchema = z.object({
  // Database / Veritabanı
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required / DATABASE_URL tələb olunur"),
  
  // NextAuth / NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL / NEXTAUTH_URL etibarlı URL olmalıdır"),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters / NEXTAUTH_SECRET ən azı 32 simvol olmalıdır"),
  
  // OAuth Providers / OAuth Provider-lər
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  
  // Payment Gateway / Ödəniş Gateway-i
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // External APIs / Xarici API-lər
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  
  // Email Configuration / Email Konfiqurasiyası
  EMAIL_SERVER_HOST: z.string().optional(),
  EMAIL_SERVER_PORT: z.string().optional(),
  EMAIL_SERVER_USER: z.string().optional(),
  EMAIL_SERVER_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  
  // Redis Configuration / Redis Konfiqurasiyası
  REDIS_URL: z.string().optional(),
  
  // Application Settings / Tətbiq Tənzimləri
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("3001"),
  
  // Security Settings / Təhlükəsizlik Tənzimləri
  CORS_ORIGIN: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  
  // Admin Specific Settings / Admin Xüsusi Tənzimləri
  ADMIN_SESSION_TIMEOUT: z.string().optional(),
  ADMIN_MAX_LOGIN_ATTEMPTS: z.string().optional(),
  
  // Logging Configuration / Logging Konfiqurasiyası
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  ADMIN_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  ADMIN_AUDIT_LOG: z.string().optional(),
  
  // File Upload Configuration / Fayl Yükləmə Konfiqurasiyası
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_FILE_SIZE: z.string().optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  
  // Admin Panel Settings / Admin Panel Tənzimləri
  ADMIN_PANEL_TITLE: z.string().optional(),
  ADMIN_PANEL_DESCRIPTION: z.string().optional(),
  
  // User Management Settings / İstifadəçi İdarəetmə Tənzimləri
  USER_AUTO_APPROVE: z.string().optional(),
  USER_EMAIL_VERIFICATION: z.string().optional(),
  
  // Product Management Settings / Məhsul İdarəetmə Tənzimləri
  PRODUCT_AUTO_APPROVE: z.string().optional(),
  PRODUCT_REQUIRE_APPROVAL: z.string().optional(),
  
  // Order Management Settings / Sifariş İdarəetmə Tənzimləri
  ORDER_AUTO_CONFIRM: z.string().optional(),
  ORDER_REQUIRE_MANUAL_REVIEW: z.string().optional(),
});

// Environment validation function / Mühit doğrulama funksiyası
export function validateAdminEnv() {
  try {
    const env = adminEnvSchema.parse(process.env);
    console.log("✅ Admin environment variables validated successfully / Admin mühit dəyişənləri uğurla doğrulandı");
    return env;
  } catch (error) {
    console.error("❌ Admin environment validation failed / Admin mühit doğrulaması uğursuz oldu:");
    if (error instanceof z.ZodError) {
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    }
    process.exit(1);
  }
}

// Type-safe environment variables / Type-safe mühit dəyişənləri
export type AdminEnv = z.infer<typeof adminEnvSchema>;

// Get environment variables with validation / Doğrulama ilə mühit dəyişənlərini əldə et
export const adminEnv = validateAdminEnv();

// Helper functions / Köməkçi funksiyalar
export const isDevelopment = adminEnv.NODE_ENV === "development";
export const isProduction = adminEnv.NODE_ENV === "production";
export const isTest = adminEnv.NODE_ENV === "test";

// Admin specific helpers / Admin xüsusi köməkçiləri
export const getAdminSessionTimeout = () => {
  return adminEnv.ADMIN_SESSION_TIMEOUT ? parseInt(adminEnv.ADMIN_SESSION_TIMEOUT) : 3600000; // 1 hour default
};

export const getAdminMaxLoginAttempts = () => {
  return adminEnv.ADMIN_MAX_LOGIN_ATTEMPTS ? parseInt(adminEnv.ADMIN_MAX_LOGIN_ATTEMPTS) : 5;
};

export const getAdminLogLevel = () => {
  return adminEnv.ADMIN_LOG_LEVEL || adminEnv.LOG_LEVEL;
};

export const isAdminAuditLogEnabled = () => {
  return adminEnv.ADMIN_AUDIT_LOG === "true";
};

export const getAdminPanelConfig = () => {
  return {
    title: adminEnv.ADMIN_PANEL_TITLE || "Yusu Admin Panel",
    description: adminEnv.ADMIN_PANEL_DESCRIPTION || "Yusu E-commerce Admin Management System",
  };
};

export const getUserManagementConfig = () => {
  return {
    autoApprove: adminEnv.USER_AUTO_APPROVE === "true",
    emailVerification: adminEnv.USER_EMAIL_VERIFICATION === "true",
  };
};

export const getProductManagementConfig = () => {
  return {
    autoApprove: adminEnv.PRODUCT_AUTO_APPROVE === "true",
    requireApproval: adminEnv.PRODUCT_REQUIRE_APPROVAL === "true",
  };
};

export const getOrderManagementConfig = () => {
  return {
    autoConfirm: adminEnv.ORDER_AUTO_CONFIRM === "true",
    requireManualReview: adminEnv.ORDER_REQUIRE_MANUAL_REVIEW === "true",
  };
};

// All helper functions are already exported above / Bütün köməkçi funksiyalar yuxarıda artıq export edilib
