/**
 * Admin Permissions System / Admin İcazə Sistemi
 * Complete control over all aspects of the platform
 * Platformanın bütün aspektləri üzərində tam nəzarət
 */

export enum AdminPermission {
  // User Management / İstifadəçi İdarəetməsi
  MANAGE_USERS = "manage_users",
  MANAGE_SELLERS = "manage_sellers", 
  MANAGE_COURIERS = "manage_couriers",
  MANAGE_CUSTOMERS = "manage_customers",
  MANAGE_ADMINS = "manage_admins",
  
  // Product Management / Məhsul İdarəetməsi
  MANAGE_PRODUCTS = "manage_products",
  MANAGE_CATEGORIES = "manage_categories",
  MANAGE_INVENTORY = "manage_inventory",
  MANAGE_PRICING = "manage_pricing",
  
  // Order Management / Sifariş İdarəetməsi
  MANAGE_ORDERS = "manage_orders",
  MANAGE_REFUNDS = "manage_refunds",
  MANAGE_SHIPPING = "manage_shipping",
  MANAGE_PAYMENTS = "manage_payments",
  
  // Content Management / Məzmun İdarəetməsi
  MANAGE_CONTENT = "manage_content",
  MANAGE_BANNERS = "manage_banners",
  MANAGE_PAGES = "manage_pages",
  MANAGE_BLOG = "manage_blog",
  MANAGE_NEWS = "manage_news",
  
  // System Management / Sistem İdarəetməsi
  MANAGE_SETTINGS = "manage_settings",
  MANAGE_EMAILS = "manage_emails",
  MANAGE_NOTIFICATIONS = "manage_notifications",
  MANAGE_LOGS = "manage_logs",
  MANAGE_BACKUPS = "manage_backups",
  
  // Analytics & Reports / Analitika və Hesabatlar
  VIEW_ANALYTICS = "view_analytics",
  VIEW_REPORTS = "view_reports",
  EXPORT_DATA = "export_data",
  VIEW_LOGS = "view_logs",
  
  // Security / Təhlükəsizlik
  MANAGE_SECURITY = "manage_security",
  MANAGE_ROLES = "manage_roles",
  MANAGE_PERMISSIONS = "manage_permissions",
  VIEW_AUDIT_LOGS = "view_audit_logs",
  
  // Financial Management / Maliyyə İdarəetməsi
  MANAGE_FINANCES = "manage_finances",
  MANAGE_COMMISSIONS = "manage_commissions",
  MANAGE_TAXES = "manage_taxes",
  MANAGE_PAYOUTS = "manage_payouts",
  
  // Marketing / Marketinq
  MANAGE_MARKETING = "manage_marketing",
  MANAGE_COUPONS = "manage_coupons",
  MANAGE_PROMOTIONS = "manage_promotions",
  MANAGE_EMAIL_CAMPAIGNS = "manage_email_campaigns",
  
  // Support / Dəstək
  MANAGE_SUPPORT = "manage_support",
  MANAGE_TICKETS = "manage_tickets",
  MANAGE_CHAT = "manage_chat",
  MANAGE_FAQ = "manage_faq",
  
  // Advanced Features / Təkmil Xüsusiyyətlər
  MANAGE_INTEGRATIONS = "manage_integrations",
  MANAGE_API = "manage_api",
  MANAGE_WEBHOOKS = "manage_webhooks",
  MANAGE_CRON_JOBS = "manage_cron_jobs",
  
  // Site Design / Sayt Dizaynı
  MANAGE_THEME = "manage_theme",
  MANAGE_LAYOUT = "manage_layout",
  MANAGE_NAVIGATION = "manage_navigation",
  MANAGE_FOOTER = "manage_footer",
  MANAGE_HEADER = "manage_header",
  
  // Database Management / Verilənlər Bazası İdarəetməsi
  MANAGE_DATABASE = "manage_database",
  MANAGE_MIGRATIONS = "manage_migrations",
  MANAGE_SEEDS = "manage_seeds",
  MANAGE_INDEXES = "manage_indexes",
  
  // File Management / Fayl İdarəetməsi
  MANAGE_FILES = "manage_files",
  MANAGE_IMAGES = "manage_images",
  MANAGE_DOCUMENTS = "manage_documents",
  MANAGE_MEDIA = "manage_media",
  
  // Communication / Əlaqə
  MANAGE_MESSAGES = "manage_messages",
  MANAGE_ANNOUNCEMENTS = "manage_announcements",
  MANAGE_FEEDBACK = "manage_feedback",
  MANAGE_REVIEWS = "manage_reviews",
  
  // Location Management / Məkan İdarəetməsi
  MANAGE_LOCATIONS = "manage_locations",
  MANAGE_ZONES = "manage_zones",
  MANAGE_DELIVERY_AREAS = "manage_delivery_areas",
  MANAGE_WAREHOUSES = "manage_warehouses",
  
  // Quality Control / Keyfiyyət Nəzarəti
  MANAGE_QUALITY = "manage_quality",
  MANAGE_INSPECTIONS = "manage_inspections",
  MANAGE_COMPLAINTS = "manage_complaints",
  MANAGE_DISPUTES = "manage_disputes",
  
  // Legal & Compliance / Hüquqi və Uyğunluq
  MANAGE_LEGAL = "manage_legal",
  MANAGE_TERMS = "manage_terms",
  MANAGE_PRIVACY = "manage_privacy",
  MANAGE_COOKIES = "manage_cookies",
  
  // Performance & Monitoring / Performans və Monitorinq
  MANAGE_PERFORMANCE = "manage_performance",
  MANAGE_CACHE = "manage_cache",
  MANAGE_CDN = "manage_cdn",
  MANAGE_MONITORING = "manage_monitoring",
  
  // Development / İnkişaf
  MANAGE_DEVELOPMENT = "manage_development",
  MANAGE_FEATURES = "manage_features",
  MANAGE_EXPERIMENTS = "manage_experiments",
  MANAGE_BETA = "manage_beta",
  
  // Super Admin / Super Admin
  SUPER_ADMIN = "super_admin",
  SYSTEM_ADMIN = "system_admin",
  PLATFORM_ADMIN = "platform_admin",
}

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SYSTEM_ADMIN = "SYSTEM_ADMIN", 
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  CONTENT_ADMIN = "CONTENT_ADMIN",
  FINANCE_ADMIN = "FINANCE_ADMIN",
  SUPPORT_ADMIN = "SUPPORT_ADMIN",
  MARKETING_ADMIN = "MARKETING_ADMIN",
  ANALYTICS_ADMIN = "ANALYTICS_ADMIN",
  SECURITY_ADMIN = "SECURITY_ADMIN",
  MODERATOR = "MODERATOR",
}

// Permission groups / İcazə qrupları
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    AdminPermission.MANAGE_USERS,
    AdminPermission.MANAGE_SELLERS,
    AdminPermission.MANAGE_COURIERS,
    AdminPermission.MANAGE_CUSTOMERS,
    AdminPermission.MANAGE_ADMINS,
  ],
  PRODUCT_MANAGEMENT: [
    AdminPermission.MANAGE_PRODUCTS,
    AdminPermission.MANAGE_CATEGORIES,
    AdminPermission.MANAGE_INVENTORY,
    AdminPermission.MANAGE_PRICING,
  ],
  ORDER_MANAGEMENT: [
    AdminPermission.MANAGE_ORDERS,
    AdminPermission.MANAGE_REFUNDS,
    AdminPermission.MANAGE_SHIPPING,
    AdminPermission.MANAGE_PAYMENTS,
  ],
  CONTENT_MANAGEMENT: [
    AdminPermission.MANAGE_CONTENT,
    AdminPermission.MANAGE_BANNERS,
    AdminPermission.MANAGE_PAGES,
    AdminPermission.MANAGE_BLOG,
    AdminPermission.MANAGE_NEWS,
  ],
  SYSTEM_MANAGEMENT: [
    AdminPermission.MANAGE_SETTINGS,
    AdminPermission.MANAGE_EMAILS,
    AdminPermission.MANAGE_NOTIFICATIONS,
    AdminPermission.MANAGE_LOGS,
    AdminPermission.MANAGE_BACKUPS,
  ],
  ANALYTICS_REPORTS: [
    AdminPermission.VIEW_ANALYTICS,
    AdminPermission.VIEW_REPORTS,
    AdminPermission.EXPORT_DATA,
    AdminPermission.VIEW_LOGS,
  ],
  SECURITY: [
    AdminPermission.MANAGE_SECURITY,
    AdminPermission.MANAGE_ROLES,
    AdminPermission.MANAGE_PERMISSIONS,
    AdminPermission.VIEW_AUDIT_LOGS,
  ],
  FINANCIAL_MANAGEMENT: [
    AdminPermission.MANAGE_FINANCES,
    AdminPermission.MANAGE_COMMISSIONS,
    AdminPermission.MANAGE_TAXES,
    AdminPermission.MANAGE_PAYOUTS,
  ],
  MARKETING: [
    AdminPermission.MANAGE_MARKETING,
    AdminPermission.MANAGE_COUPONS,
    AdminPermission.MANAGE_PROMOTIONS,
    AdminPermission.MANAGE_EMAIL_CAMPAIGNS,
  ],
  SUPPORT: [
    AdminPermission.MANAGE_SUPPORT,
    AdminPermission.MANAGE_TICKETS,
    AdminPermission.MANAGE_CHAT,
    AdminPermission.MANAGE_FAQ,
  ],
  ADVANCED_FEATURES: [
    AdminPermission.MANAGE_INTEGRATIONS,
    AdminPermission.MANAGE_API,
    AdminPermission.MANAGE_WEBHOOKS,
    AdminPermission.MANAGE_CRON_JOBS,
  ],
  SITE_DESIGN: [
    AdminPermission.MANAGE_THEME,
    AdminPermission.MANAGE_LAYOUT,
    AdminPermission.MANAGE_NAVIGATION,
    AdminPermission.MANAGE_FOOTER,
    AdminPermission.MANAGE_HEADER,
  ],
  DATABASE_MANAGEMENT: [
    AdminPermission.MANAGE_DATABASE,
    AdminPermission.MANAGE_MIGRATIONS,
    AdminPermission.MANAGE_SEEDS,
    AdminPermission.MANAGE_INDEXES,
  ],
  FILE_MANAGEMENT: [
    AdminPermission.MANAGE_FILES,
    AdminPermission.MANAGE_IMAGES,
    AdminPermission.MANAGE_DOCUMENTS,
    AdminPermission.MANAGE_MEDIA,
  ],
  COMMUNICATION: [
    AdminPermission.MANAGE_MESSAGES,
    AdminPermission.MANAGE_ANNOUNCEMENTS,
    AdminPermission.MANAGE_FEEDBACK,
    AdminPermission.MANAGE_REVIEWS,
  ],
  LOCATION_MANAGEMENT: [
    AdminPermission.MANAGE_LOCATIONS,
    AdminPermission.MANAGE_ZONES,
    AdminPermission.MANAGE_DELIVERY_AREAS,
    AdminPermission.MANAGE_WAREHOUSES,
  ],
  QUALITY_CONTROL: [
    AdminPermission.MANAGE_QUALITY,
    AdminPermission.MANAGE_INSPECTIONS,
    AdminPermission.MANAGE_COMPLAINTS,
    AdminPermission.MANAGE_DISPUTES,
  ],
  LEGAL_COMPLIANCE: [
    AdminPermission.MANAGE_LEGAL,
    AdminPermission.MANAGE_TERMS,
    AdminPermission.MANAGE_PRIVACY,
    AdminPermission.MANAGE_COOKIES,
  ],
  PERFORMANCE_MONITORING: [
    AdminPermission.MANAGE_PERFORMANCE,
    AdminPermission.MANAGE_CACHE,
    AdminPermission.MANAGE_CDN,
    AdminPermission.MANAGE_MONITORING,
  ],
  DEVELOPMENT: [
    AdminPermission.MANAGE_DEVELOPMENT,
    AdminPermission.MANAGE_FEATURES,
    AdminPermission.MANAGE_EXPERIMENTS,
    AdminPermission.MANAGE_BETA,
  ],
  SUPER_ADMIN: [
    AdminPermission.SUPER_ADMIN,
    AdminPermission.SYSTEM_ADMIN,
    AdminPermission.PLATFORM_ADMIN,
  ],
};

// Role permissions / Rol icazələri
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(AdminPermission),
  [AdminRole.SYSTEM_ADMIN]: [
    ...PERMISSION_GROUPS.SYSTEM_MANAGEMENT,
    ...PERMISSION_GROUPS.SECURITY,
    ...PERMISSION_GROUPS.DATABASE_MANAGEMENT,
    ...PERMISSION_GROUPS.PERFORMANCE_MONITORING,
    ...PERMISSION_GROUPS.DEVELOPMENT,
  ],
  [AdminRole.PLATFORM_ADMIN]: [
    ...PERMISSION_GROUPS.USER_MANAGEMENT,
    ...PERMISSION_GROUPS.PRODUCT_MANAGEMENT,
    ...PERMISSION_GROUPS.ORDER_MANAGEMENT,
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
    ...PERMISSION_GROUPS.ANALYTICS_REPORTS,
    ...PERMISSION_GROUPS.FINANCIAL_MANAGEMENT,
    ...PERMISSION_GROUPS.MARKETING,
    ...PERMISSION_GROUPS.SUPPORT,
    ...PERMISSION_GROUPS.SITE_DESIGN,
  ],
  [AdminRole.CONTENT_ADMIN]: [
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
    ...PERMISSION_GROUPS.SITE_DESIGN,
    ...PERMISSION_GROUPS.FILE_MANAGEMENT,
    ...PERMISSION_GROUPS.COMMUNICATION,
  ],
  [AdminRole.FINANCE_ADMIN]: [
    ...PERMISSION_GROUPS.FINANCIAL_MANAGEMENT,
    ...PERMISSION_GROUPS.ANALYTICS_REPORTS,
    ...PERMISSION_GROUPS.ORDER_MANAGEMENT,
  ],
  [AdminRole.SUPPORT_ADMIN]: [
    ...PERMISSION_GROUPS.SUPPORT,
    ...PERMISSION_GROUPS.COMMUNICATION,
    ...PERMISSION_GROUPS.QUALITY_CONTROL,
  ],
  [AdminRole.MARKETING_ADMIN]: [
    ...PERMISSION_GROUPS.MARKETING,
    ...PERMISSION_GROUPS.ANALYTICS_REPORTS,
    ...PERMISSION_GROUPS.CONTENT_MANAGEMENT,
  ],
  [AdminRole.ANALYTICS_ADMIN]: [
    ...PERMISSION_GROUPS.ANALYTICS_REPORTS,
    ...PERMISSION_GROUPS.PERFORMANCE_MONITORING,
  ],
  [AdminRole.SECURITY_ADMIN]: [
    ...PERMISSION_GROUPS.SECURITY,
    ...PERMISSION_GROUPS.SYSTEM_MANAGEMENT,
    ...PERMISSION_GROUPS.PERFORMANCE_MONITORING,
  ],
  [AdminRole.MODERATOR]: [
    AdminPermission.MANAGE_USERS,
    AdminPermission.MANAGE_PRODUCTS,
    AdminPermission.MANAGE_ORDERS,
    AdminPermission.MANAGE_CONTENT,
    AdminPermission.MANAGE_SUPPORT,
  ],
};

// Permission descriptions / İcazə təsvirləri
export const PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  [AdminPermission.MANAGE_USERS]: "Manage all users / Bütün istifadəçiləri idarə et",
  [AdminPermission.MANAGE_SELLERS]: "Manage sellers and their permissions / Satıcıları və onların icazələrini idarə et",
  [AdminPermission.MANAGE_COURIERS]: "Manage couriers and their permissions / Kuryerləri və onların icazələrini idarə et",
  [AdminPermission.MANAGE_CUSTOMERS]: "Manage customers and their data / Müştəriləri və onların məlumatlarını idarə et",
  [AdminPermission.MANAGE_ADMINS]: "Manage admin users and roles / Admin istifadəçiləri və rolları idarə et",
  [AdminPermission.MANAGE_PRODUCTS]: "Manage all products / Bütün məhsulları idarə et",
  [AdminPermission.MANAGE_CATEGORIES]: "Manage product categories / Məhsul kateqoriyalarını idarə et",
  [AdminPermission.MANAGE_INVENTORY]: "Manage product inventory / Məhsul inventarını idarə et",
  [AdminPermission.MANAGE_PRICING]: "Manage product pricing / Məhsul qiymətləndirməsini idarə et",
  [AdminPermission.MANAGE_ORDERS]: "Manage all orders / Bütün sifarişləri idarə et",
  [AdminPermission.MANAGE_REFUNDS]: "Manage refunds and returns / Geri ödənişləri və qaytarmaları idarə et",
  [AdminPermission.MANAGE_SHIPPING]: "Manage shipping and delivery / Çatdırılma və göndərməni idarə et",
  [AdminPermission.MANAGE_PAYMENTS]: "Manage payment methods and transactions / Ödəniş üsulları və əməliyyatları idarə et",
  [AdminPermission.MANAGE_CONTENT]: "Manage website content / Sayt məzmununu idarə et",
  [AdminPermission.MANAGE_BANNERS]: "Manage banners and advertisements / Banner və reklamları idarə et",
  [AdminPermission.MANAGE_PAGES]: "Manage website pages / Sayt səhifələrini idarə et",
  [AdminPermission.MANAGE_BLOG]: "Manage blog posts / Blog yazılarını idarə et",
  [AdminPermission.MANAGE_NEWS]: "Manage news and announcements / Xəbər və elanları idarə et",
  [AdminPermission.MANAGE_SETTINGS]: "Manage system settings / Sistem tənzimlərini idarə et",
  [AdminPermission.MANAGE_EMAILS]: "Manage email templates and campaigns / E-poçt şablonları və kampaniyaları idarə et",
  [AdminPermission.MANAGE_NOTIFICATIONS]: "Manage notifications / Bildirişləri idarə et",
  [AdminPermission.MANAGE_LOGS]: "Manage system logs / Sistem loglarını idarə et",
  [AdminPermission.MANAGE_BACKUPS]: "Manage backups and restore / Backup və bərpa idarə et",
  [AdminPermission.VIEW_ANALYTICS]: "View analytics and statistics / Analitika və statistikaya bax",
  [AdminPermission.VIEW_REPORTS]: "View and generate reports / Hesabatları görüntülə və yarat",
  [AdminPermission.EXPORT_DATA]: "Export data and reports / Məlumat və hesabatları ixrac et",
  [AdminPermission.VIEW_LOGS]: "View system logs / Sistem loglarına bax",
  [AdminPermission.MANAGE_SECURITY]: "Manage security settings / Təhlükəsizlik tənzimlərini idarə et",
  [AdminPermission.MANAGE_ROLES]: "Manage user roles / İstifadəçi rollarını idarə et",
  [AdminPermission.MANAGE_PERMISSIONS]: "Manage permissions / İcazələri idarə et",
  [AdminPermission.VIEW_AUDIT_LOGS]: "View audit logs / Audit loglarına bax",
  [AdminPermission.MANAGE_FINANCES]: "Manage financial operations / Maliyyə əməliyyatlarını idarə et",
  [AdminPermission.MANAGE_COMMISSIONS]: "Manage commissions and fees / Komissiya və haqları idarə et",
  [AdminPermission.MANAGE_TAXES]: "Manage tax settings / Vergi tənzimlərini idarə et",
  [AdminPermission.MANAGE_PAYOUTS]: "Manage payouts to sellers / Satıcılara ödənişləri idarə et",
  [AdminPermission.MANAGE_MARKETING]: "Manage marketing campaigns / Marketinq kampaniyalarını idarə et",
  [AdminPermission.MANAGE_COUPONS]: "Manage coupons and discounts / Kupon və endirimləri idarə et",
  [AdminPermission.MANAGE_PROMOTIONS]: "Manage promotions and offers / Təklif və kampaniyaları idarə et",
  [AdminPermission.MANAGE_EMAIL_CAMPAIGNS]: "Manage email marketing campaigns / E-poçt marketinq kampaniyalarını idarə et",
  [AdminPermission.MANAGE_SUPPORT]: "Manage customer support / Müştəri dəstəyini idarə et",
  [AdminPermission.MANAGE_TICKETS]: "Manage support tickets / Dəstək biletlərini idarə et",
  [AdminPermission.MANAGE_CHAT]: "Manage live chat / Canlı söhbəti idarə et",
  [AdminPermission.MANAGE_FAQ]: "Manage FAQ and help content / FAQ və kömək məzmununu idarə et",
  [AdminPermission.MANAGE_INTEGRATIONS]: "Manage third-party integrations / Üçüncü tərəf inteqrasiyalarını idarə et",
  [AdminPermission.MANAGE_API]: "Manage API access and keys / API girişi və açarlarını idarə et",
  [AdminPermission.MANAGE_WEBHOOKS]: "Manage webhooks / Webhookları idarə et",
  [AdminPermission.MANAGE_CRON_JOBS]: "Manage scheduled tasks / Planlaşdırılmış tapşırıqları idarə et",
  [AdminPermission.MANAGE_THEME]: "Manage website theme / Sayt temasını idarə et",
  [AdminPermission.MANAGE_LAYOUT]: "Manage website layout / Sayt düzənini idarə et",
  [AdminPermission.MANAGE_NAVIGATION]: "Manage navigation menu / Naviqasiya menyusunu idarə et",
  [AdminPermission.MANAGE_FOOTER]: "Manage footer content / Footer məzmununu idarə et",
  [AdminPermission.MANAGE_HEADER]: "Manage header content / Header məzmununu idarə et",
  [AdminPermission.MANAGE_DATABASE]: "Manage database operations / Verilənlər bazası əməliyyatlarını idarə et",
  [AdminPermission.MANAGE_MIGRATIONS]: "Manage database migrations / Verilənlər bazası miqrasiyalarını idarə et",
  [AdminPermission.MANAGE_SEEDS]: "Manage database seeds / Verilənlər bazası seedlərini idarə et",
  [AdminPermission.MANAGE_INDEXES]: "Manage database indexes / Verilənlər bazası indekslərini idarə et",
  [AdminPermission.MANAGE_FILES]: "Manage file uploads and storage / Fayl yükləmə və saxlama idarə et",
  [AdminPermission.MANAGE_IMAGES]: "Manage images and media / Şəkil və media idarə et",
  [AdminPermission.MANAGE_DOCUMENTS]: "Manage documents and files / Sənəd və faylları idarə et",
  [AdminPermission.MANAGE_MEDIA]: "Manage media library / Media kitabxanasını idarə et",
  [AdminPermission.MANAGE_MESSAGES]: "Manage internal messages / Daxili mesajları idarə et",
  [AdminPermission.MANAGE_ANNOUNCEMENTS]: "Manage announcements / Elanları idarə et",
  [AdminPermission.MANAGE_FEEDBACK]: "Manage user feedback / İstifadəçi rəylərini idarə et",
  [AdminPermission.MANAGE_REVIEWS]: "Manage product reviews / Məhsul rəylərini idarə et",
  [AdminPermission.MANAGE_LOCATIONS]: "Manage locations and addresses / Məkan və ünvanları idarə et",
  [AdminPermission.MANAGE_ZONES]: "Manage delivery zones / Çatdırılma zonalarını idarə et",
  [AdminPermission.MANAGE_DELIVERY_AREAS]: "Manage delivery areas / Çatdırılma sahələrini idarə et",
  [AdminPermission.MANAGE_WAREHOUSES]: "Manage warehouses / Anbarları idarə et",
  [AdminPermission.MANAGE_QUALITY]: "Manage quality control / Keyfiyyət nəzarətini idarə et",
  [AdminPermission.MANAGE_INSPECTIONS]: "Manage product inspections / Məhsul yoxlamalarını idarə et",
  [AdminPermission.MANAGE_COMPLAINTS]: "Manage customer complaints / Müştəri şikayətlərini idarə et",
  [AdminPermission.MANAGE_DISPUTES]: "Manage disputes and conflicts / Mübahisə və konfliktləri idarə et",
  [AdminPermission.MANAGE_LEGAL]: "Manage legal documents / Hüquqi sənədləri idarə et",
  [AdminPermission.MANAGE_TERMS]: "Manage terms and conditions / Şərt və qaydaları idarə et",
  [AdminPermission.MANAGE_PRIVACY]: "Manage privacy policy / Məxfilik siyasətini idarə et",
  [AdminPermission.MANAGE_COOKIES]: "Manage cookie settings / Cookie tənzimlərini idarə et",
  [AdminPermission.MANAGE_PERFORMANCE]: "Manage system performance / Sistem performansını idarə et",
  [AdminPermission.MANAGE_CACHE]: "Manage caching system / Keş sistemini idarə et",
  [AdminPermission.MANAGE_CDN]: "Manage CDN settings / CDN tənzimlərini idarə et",
  [AdminPermission.MANAGE_MONITORING]: "Manage monitoring and alerts / Monitorinq və xəbərdarlıqları idarə et",
  [AdminPermission.MANAGE_DEVELOPMENT]: "Manage development features / İnkişaf xüsusiyyətlərini idarə et",
  [AdminPermission.MANAGE_FEATURES]: "Manage feature flags / Xüsusiyyət bayraqlarını idarə et",
  [AdminPermission.MANAGE_EXPERIMENTS]: "Manage A/B testing / A/B testlərini idarə et",
  [AdminPermission.MANAGE_BETA]: "Manage beta features / Beta xüsusiyyətlərini idarə et",
  [AdminPermission.SUPER_ADMIN]: "Super admin access / Super admin girişi",
  [AdminPermission.SYSTEM_ADMIN]: "System admin access / Sistem admin girişi",
  [AdminPermission.PLATFORM_ADMIN]: "Platform admin access / Platform admin girişi",
};

// Check if user has permission / İstifadəçinin icazəsi var mı yoxla
export function hasPermission(userRole: AdminRole, permission: AdminPermission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Check if user has any of the permissions / İstifadəçinin hər hansı icazəsi var mı yoxla
export function hasAnyPermission(userRole: AdminRole, permissions: AdminPermission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Check if user has all permissions / İstifadəçinin bütün icazələri var mı yoxla
export function hasAllPermissions(userRole: AdminRole, permissions: AdminPermission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Get user permissions / İstifadəçi icazələrini al
export function getUserPermissions(userRole: AdminRole): AdminPermission[] {
  return ROLE_PERMISSIONS[userRole] || [];
}

// Get permission groups for user / İstifadəçi üçün icazə qruplarını al
export function getUserPermissionGroups(userRole: AdminRole): string[] {
  const permissions = getUserPermissions(userRole);
  const groups: string[] = [];
  
  Object.entries(PERMISSION_GROUPS).forEach(([groupName, groupPermissions]) => {
    if (groupPermissions.some(permission => permissions.includes(permission))) {
      groups.push(groupName);
    }
  });
  
  return groups;
}
