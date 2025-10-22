# Admin Panel API Documentation / Admin Panel API Sənədləşməsi

## Overview / Ümumi Baxış

This document describes the Admin Panel API endpoints for the Yusu e-commerce platform.
Bu sənəd Yusu e-commerce platforması üçün Admin Panel API endpoint-lərini təsvir edir.

## Base URL / Əsas URL

```
http://localhost:3001/api/admin
```

## Authentication / Autentifikasiya

All admin endpoints require authentication. Use NextAuth.js session-based authentication.
Bütün admin endpoint-ləri autentifikasiya tələb edir. NextAuth.js sessiya əsaslı autentifikasiya istifadə edin.

### Login / Giriş

```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "admin@yusu.com"
}
```

## API Endpoints / API Endpoint-ləri

### 1. Users Management / İstifadəçi İdarəetməsi

#### Get All Users / Bütün İstifadəçiləri Gətir

```http
GET /api/admin/users?page=1&limit=20&role=ADMIN&search=admin
```

**Query Parameters / Sorğu Parametrləri:**
- `page` (optional): Page number / Səhifə nömrəsi (default: 1)
- `limit` (optional): Items per page / Səhifədə element sayı (default: 20)
- `role` (optional): Filter by role / Rola görə filtr (CUSTOMER, SELLER, COURIER, ADMIN)
- `search` (optional): Search by name or email / Ad və ya email-ə görə axtarış

**Response / Cavab:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "phone": "+994501234567",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "orders": 5,
        "products": 0,
        "reviews": 2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Update User / İstifadəçini Yenilə

```http
PUT /api/admin/users
Content-Type: application/json

{
  "userId": "user_id",
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "SELLER",
  "phone": "+994501234567",
  "isActive": true
}
```

#### Delete User / İstifadəçini Sil

```http
DELETE /api/admin/users?id=user_id
```

### 2. Products Management / Məhsul İdarəetməsi

#### Get All Products / Bütün Məhsulları Gətir

```http
GET /api/admin/products?page=1&limit=10
```

**Response / Cavab:**
```json
{
  "products": [
    {
      "id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "originalPrice": 129.99,
      "images": "[\"image1.jpg\", \"image2.jpg\"]",
      "categoryId": "category_id",
      "sellerId": "seller_id",
      "stock": 50,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "category_id",
        "name": "Category Name"
      },
      "seller": {
        "id": "seller_id",
        "name": "Seller Name",
        "email": "seller@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### Get Single Product / Tək Məhsul Gətir

```http
GET /api/admin/products/{id}
```

#### Update Product / Məhsulu Yenilə

```http
PUT /api/admin/products/{id}
Content-Type: application/json

{
  "isActive": true,
  "name": "Updated Product Name",
  "description": "Updated Description",
  "price": 89.99,
  "stock": 25
}
```

#### Delete Product / Məhsulu Sil

```http
DELETE /api/admin/products/{id}
```

### 3. Orders Management / Sifariş İdarəetməsi

#### Get All Orders / Bütün Sifarişləri Gətir

```http
GET /api/admin/orders?page=1&limit=10&status=PENDING
```

**Query Parameters / Sorğu Parametrləri:**
- `page` (optional): Page number / Səhifə nömrəsi (default: 1)
- `limit` (optional): Items per page / Səhifədə element sayı (default: 10)
- `status` (optional): Filter by status / Statusa görə filtr (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)

**Response / Cavab:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_id",
      "customerId": "customer_id",
      "sellerId": "seller_id",
      "courierId": "courier_id",
      "status": "PENDING",
      "totalAmount": 199.98,
      "shippingAddress": "{\"street\":\"Main St\",\"city\":\"Baku\"}",
      "addressId": "address_id",
      "paymentIntentId": "pi_1234567890",
      "paymentStatus": "PAID",
      "paidAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "customer": {
        "id": "customer_id",
        "name": "Customer Name",
        "email": "customer@example.com"
      },
      "seller": {
        "id": "seller_id",
        "name": "Seller Name",
        "email": "seller@example.com"
      },
      "courier": {
        "id": "courier_id",
        "name": "Courier Name",
        "email": "courier@example.com"
      },
      "items": [
        {
          "id": "item_id",
          "orderId": "order_id",
          "productId": "product_id",
          "quantity": 2,
          "price": 99.99,
          "product": {
            "id": "product_id",
            "name": "Product Name",
            "price": 99.99,
            "images": "[\"image1.jpg\"]"
          }
        }
      ],
      "address": {
        "id": "address_id",
        "street": "Main Street",
        "city": "Baku",
        "state": "Baku",
        "zipCode": "1000",
        "country": "Azerbaijan"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Update Order / Sifarişi Yenilə

```http
PUT /api/admin/orders
Content-Type: application/json

{
  "orderId": "order_id",
  "status": "CONFIRMED",
  "courierId": "courier_id"
}
```

#### Delete Order / Sifarişi Sil

```http
DELETE /api/admin/orders?id=order_id
```

### 4. Statistics / Statistikalar

#### Get Admin Statistics / Admin Statistikalarını Gətir

```http
GET /api/admin/stats
```

**Response / Cavab:**
```json
{
  "totalUsers": 150,
  "activeUsers": 140,
  "inactiveUsers": 10,
  "totalProducts": 500,
  "totalOrders": 1200,
  "pendingOrders": 25,
  "completedOrders": 1100,
  "totalRevenue": 50000.00,
  "userGrowth": 12,
  "orderGrowth": 8,
  "revenueGrowth": 15
}
```

### 5. Activity / Fəaliyyət

#### Get Recent Activity / Son Fəaliyyəti Gətir

```http
GET /api/admin/activity?limit=10
```

**Query Parameters / Sorğu Parametrləri:**
- `limit` (optional): Number of activities / Fəaliyyət sayı (default: 10)

**Response / Cavab:**
```json
{
  "activities": [
    {
      "id": "order-12345678",
      "type": "order",
      "description": "New order #12345678 placed by John Doe",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "user": "John Doe"
    },
    {
      "id": "user-87654321",
      "type": "user",
      "description": "New user Jane Smith registered as CUSTOMER",
      "timestamp": "2024-01-01T11:30:00.000Z",
      "user": "Jane Smith"
    }
  ]
}
```

## Error Responses / Xəta Cavabları

All endpoints return consistent error responses:
Bütün endpoint-lər ardıcıl xəta cavabları qaytarır:

```json
{
  "success": false,
  "error": "Error message in English and Azerbaijani / İngilis və Azərbaycan dillərində xəta mesajı"
}
```

### Common Error Codes / Ümumi Xəta Kodları

- `400` - Bad Request / Yanlış Sorğu
- `401` - Unauthorized / Yetkisiz
- `404` - Not Found / Tapılmadı
- `500` - Internal Server Error / Daxili Server Xətası

## Rate Limiting / Sürət Məhdudiyyəti

- 100 requests per minute per IP / IP üzrə dəqiqədə 100 sorğu
- 1000 requests per hour per authenticated user / Autentifikasiya edilmiş istifadəçi üzrə saatda 1000 sorğu

## Security / Təhlükəsizlik

- All endpoints require authentication / Bütün endpoint-lər autentifikasiya tələb edir
- Input validation using Zod schemas / Zod sxemləri ilə input yoxlanması
- SQL injection protection via Prisma / Prisma vasitəsilə SQL injection qorunması
- CORS enabled for specific origins / Xüsusi mənbələr üçün CORS aktiv

## Testing / Test

Use the provided test script to verify API functionality:
API funksionallığını yoxlamaq üçün təmin edilmiş test skriptini istifadə edin:

```bash
cd yusu-admin
npx tsx src/lib/api-test.ts
```

## Support / Dəstək

For API support, contact the development team.
API dəstəyi üçün inkişaf komandası ilə əlaqə saxlayın.
