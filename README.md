# Yusu Admin Panel / Yusu Admin Paneli

## 📋 Təsvir / Description

Yusu Admin Panel - Platforma idarəetməsi üçün xüsusi admin paneli / Special admin panel for platform management.

Bu panel adminlər üçün platforma idarəetməsi, istifadəçi nəzarəti, məhsul təsdiqi və sistem konfiqurasiyası üçün yaradılmışdır.

This panel is designed for administrators to manage the platform, control users, approve products, and configure system settings.

## 🚀 Xüsusiyyətlər / Features

### Platforma İdarəetməsi / Platform Management
- ✅ İstifadəçi idarəetməsi / User management
- ✅ Məhsul təsdiqi / Product approval
- ✅ Kateqoriya idarəetməsi / Category management
- ✅ Sifariş nəzarəti / Order oversight
- ✅ Ödəniş monitorinqi / Payment monitoring

### Analitika və Hesabatlar / Analytics and Reports
- ✅ Satış statistikaları / Sales statistics
- ✅ İstifadəçi analizi / User analysis
- ✅ Məhsul performansı / Product performance
- ✅ Gəlir analizi / Revenue analysis
- ✅ Real-vaxt dashboard / Real-time dashboard

### Sistem Konfiqurasiyası / System Configuration
- ✅ Platforma ayarları / Platform settings
- ✅ Təhlükəsizlik konfiqurasiyası / Security configuration
- ✅ Bildiriş idarəetməsi / Notification management
- ✅ Backup və bərpa / Backup and restore
- ✅ Sistem monitorinqi / System monitoring

## 🛠️ Texnologiyalar / Technologies

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS, Radix UI
- **Database:** Prisma ORM, SQLite
- **Authentication:** Custom Admin Auth
- **State Management:** React Context

## 📁 Proyekt Strukturu / Project Structure

```
yusu-admin/
├── src/
│   ├── app/
│   │   ├── admin/             # Admin səhifələri / Admin pages
│   │   ├── api/admin/         # Admin API-ləri / Admin APIs
│   │   └── auth/              # Admin giriş səhifələri / Admin auth pages
│   ├── components/            # Komponentlər / Components
│   ├── lib/                   # Yardımçı funksiyalar / Helper functions
│   └── types/                 # TypeScript tipləri / TypeScript types
├── prisma/                    # Veritabanı şeması / Database schema
└── public/                    # Statik fayllar / Static files
```

## 🚀 Quraşdırma / Installation

### Tələblər / Requirements
- Node.js 18+
- npm və ya yarn
- SQLite veritabanı / SQLite database

### Addımlar / Steps

1. **Bağımlılıqları yükləyin / Install dependencies:**
```bash
npm install
```

2. **Veritabanını quraşdırın / Setup database:**
```bash
npx prisma migrate dev
npx prisma db:seed
```

3. **Mühit dəyişənlərini təyin edin / Set environment variables:**
```bash
cp .env.example .env.local
# .env.local faylını redaktə edin / Edit .env.local file
```

4. **Proyekti işə salın / Start the project:**
```bash
npm run dev
```

## 🌐 URL Strukturu / URL Structure

- **Ana səhifə / Home:** `http://localhost:3001/`
- **Admin Dashboard:** `http://localhost:3001/admin/dashboard`
- **İstifadəçilər / Users:** `http://localhost:3001/admin/users`
- **Məhsullar / Products:** `http://localhost:3001/admin/products`
- **Kateqoriyalar / Categories:** `http://localhost:3001/admin/categories`
- **Sifarişlər / Orders:** `http://localhost:3001/admin/orders`
- **Admin Girişi / Admin Login:** `http://localhost:3001/auth/admin-login`

## 🔐 Təhlükəsizlik / Security

- ✅ Admin autentifikasi / Admin authentication
- ✅ JWT token təhlükəsizliyi / JWT token security
- ✅ CSRF qorunması / CSRF protection
- ✅ XSS qorunması / XSS protection
- ✅ SQL injection qorunması / SQL injection protection
- ✅ Admin şifrə bərpası / Admin password recovery

## 📚 API Sənədləşməsi / API Documentation

### Admin API Endpoints

#### İstifadəçi İdarəetməsi / User Management
- `GET /api/admin/users` - İstifadəçiləri listələ / List users
- `GET /api/admin/users/[id]` - İstifadəçi detalları / User details
- `PUT /api/admin/users/[id]` - İstifadəçini yenilə / Update user
- `DELETE /api/admin/users/[id]` - İstifadəçini sil / Delete user
- `PUT /api/admin/users/[id]/status` - İstifadəçi statusunu dəyişdir / Change user status

#### Məhsul İdarəetməsi / Product Management
- `GET /api/admin/products` - Məhsulları listələ / List products
- `GET /api/admin/products/[id]` - Məhsul detalları / Product details
- `PUT /api/admin/products/[id]` - Məhsulu yenilə / Update product
- `DELETE /api/admin/products/[id]` - Məhsulu sil / Delete product
- `PUT /api/admin/products/[id]/approve` - Məhsulu təsdiq et / Approve product

#### Kateqoriya İdarəetməsi / Category Management
- `GET /api/admin/categories` - Kateqoriyaları listələ / List categories
- `POST /api/admin/categories` - Yeni kateqoriya yarat / Create new category
- `PUT /api/admin/categories/[id]` - Kateqoriyanı yenilə / Update category
- `DELETE /api/admin/categories/[id]` - Kateqoriyanı sil / Delete category

#### Sifariş İdarəetməsi / Order Management
- `GET /api/admin/orders` - Sifarişləri listələ / List orders
- `GET /api/admin/orders/[id]` - Sifariş detalları / Order details
- `PUT /api/admin/orders/[id]` - Sifariş statusunu yenilə / Update order status
- `GET /api/admin/orders/stats` - Sifariş statistikaları / Order statistics

#### Statistika / Statistics
- `GET /api/admin/stats` - Ümumi statistikalar / General statistics
- `GET /api/admin/stats/sales` - Satış statistikaları / Sales statistics
- `GET /api/admin/stats/users` - İstifadəçi statistikaları / User statistics
- `GET /api/admin/stats/products` - Məhsul statistikaları / Product statistics

## 👑 Admin Funksiyaları / Admin Functions

### İstifadəçi İdarəetməsi / User Management
- ✅ Bütün istifadəçiləri görüntüləmə / View all users
- ✅ İstifadəçi rollarını dəyişdirmə / Change user roles
- ✅ İstifadəçi statusunu idarə etmə / Manage user status
- ✅ İstifadəçi məlumatlarını redaktə etmə / Edit user information
- ✅ İstifadəçi hesablarını bloklama / Block user accounts

### Məhsul Təsdiqi / Product Approval
- ✅ Yeni məhsulları təsdiq etmə / Approve new products
- ✅ Məhsul məlumatlarını yoxlama / Review product information
- ✅ Məhsul şəkillərini təsdiq etmə / Approve product images
- ✅ Məhsul qiymətlərini yoxlama / Review product prices
- ✅ Məhsul kateqoriyalarını təyin etmə / Assign product categories

### Platforma Konfiqurasiyası / Platform Configuration
- ✅ Sistem ayarlarını dəyişdirmə / Change system settings
- ✅ Bildiriş konfiqurasiyası / Notification configuration
- ✅ Təhlükəsizlik ayarları / Security settings
- ✅ Backup və bərpa / Backup and restore
- ✅ Sistem loglarını izləmə / Monitor system logs

## 📊 Dashboard Xüsusiyyətləri / Dashboard Features

### Real-vaxt Statistikalar / Real-time Statistics
- ✅ Günlük satışlar / Daily sales
- ✅ Aylıq gəlir / Monthly revenue
- ✅ Aktiv istifadəçilər / Active users
- ✅ Yeni sifarişlər / New orders
- ✅ Platforma performansı / Platform performance

### Qrafik və Diaqramlar / Charts and Diagrams
- ✅ Satış qrafikləri / Sales charts
- ✅ İstifadəçi artımı / User growth
- ✅ Məhsul performansı / Product performance
- ✅ Kateqoriya analizi / Category analysis
- ✅ Müştəri davranışı / Customer behavior

## 🔧 Sistem İdarəetməsi / System Management

### Backup və Bərpa / Backup and Restore
- ✅ Avtomatik backup / Automatic backup
- ✅ Manual backup / Manual backup
- ✅ Veritabanı bərpası / Database restore
- ✅ Fayl bərpası / File restore

### Monitorinq / Monitoring
- ✅ Sistem performansı / System performance
- ✅ Server statusu / Server status
- ✅ Veritabanı performansı / Database performance
- ✅ Xəta logları / Error logs

## 🤝 Töhfə Vermək / Contributing

1. Fork edin / Fork the project
2. Feature branch yaradın / Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit edin / Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push edin / Push to branch (`git push origin feature/AmazingFeature`)
5. Pull Request yaradın / Open Pull Request

## 📄 Lisenziya / License

Bu proyekt MIT lisenziyası altında paylaşılır / This project is licensed under the MIT License.

## 📞 Əlaqə / Contact

- **Email:** admin@yusu.com
- **Website:** https://admin.yusu.com
- **Support:** support@yusu.com

---

**Yusu Admin Panel** - Platforma idarəetməsi üçün ən yaxşı həll / The best solution for platform management