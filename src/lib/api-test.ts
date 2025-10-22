/**
 * Admin API Test Script / Admin API Test Skripti
 * This script tests all admin API endpoints
 * Bu skript bütün admin API endpoint-lərini test edir
 */

import { prisma } from './db';

// Test data / Test məlumatları
const testData = {
  adminEmail: 'admin@yusu.com',
  testUser: {
    name: 'Test User',
    email: 'test@example.com',
    role: 'CUSTOMER' as const,
    phone: '+994501234567'
  },
  testProduct: {
    name: 'Test Product',
    description: 'Test product description',
    price: 99.99,
    stock: 10,
    categoryId: '',
    sellerId: ''
  }
};

async function testAdminAPIs() {
  console.log('🧪 Starting Admin API Tests / Admin API Testləri Başlayır...\n');

  try {
    // Test 1: Database Connection / Test 1: Veritabanı Bağlantısı
    console.log('1️⃣ Testing database connection / Veritabanı bağlantısını test edir...');
    await prisma.$connect();
    console.log('✅ Database connected / Veritabanı bağlandı\n');

    // Test 2: Get Admin User / Test 2: Admin İstifadəçisini Gətir
    console.log('2️⃣ Testing admin user retrieval / Admin istifadəçi əldə etməni test edir...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, email: true, name: true, role: true }
    });
    
    if (adminUser) {
      console.log(`✅ Admin user found: ${adminUser.email} (${adminUser.name})`);
      testData.testProduct.sellerId = adminUser.id;
    } else {
      console.log('❌ Admin user not found / Admin istifadəçi tapılmadı');
    }

    // Test 3: Get Categories / Test 3: Kateqoriyaları Gətir
    console.log('\n3️⃣ Testing categories retrieval / Kateqoriya əldə etməni test edir...');
    const categories = await prisma.category.findMany({
      take: 1,
      select: { id: true, name: true }
    });
    
    if (categories.length > 0) {
      testData.testProduct.categoryId = categories[0].id;
      console.log(`✅ Category found: ${categories[0].name}`);
    } else {
      console.log('❌ No categories found / Kateqoriya tapılmadı');
    }

    // Test 4: Create Test User / Test 4: Test İstifadəçisi Yarat
    console.log('\n4️⃣ Testing user creation / İstifadəçi yaratmanı test edir...');
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.testUser.email }
    });

    let testUserId = '';
    if (existingUser) {
      testUserId = existingUser.id;
      console.log('✅ Test user already exists / Test istifadəçi artıq mövcuddur');
    } else {
      const newUser = await prisma.user.create({
        data: testData.testUser
      });
      testUserId = newUser.id;
      console.log('✅ Test user created / Test istifadəçi yaradıldı');
    }

    // Test 5: Create Test Product / Test 5: Test Məhsulu Yarat
    console.log('\n5️⃣ Testing product creation / Məhsul yaratmanı test edir...');
    const existingProduct = await prisma.product.findFirst({
      where: { name: testData.testProduct.name }
    });

    let testProductId = '';
    if (existingProduct) {
      testProductId = existingProduct.id;
      console.log('✅ Test product already exists / Test məhsul artıq mövcuddur');
    } else {
      const newProduct = await prisma.product.create({
        data: {
          ...testData.testProduct,
          images: '["test-image.jpg"]'
        }
      });
      testProductId = newProduct.id;
      console.log('✅ Test product created / Test məhsul yaradıldı');
    }

    // Test 6: Create Test Order / Test 6: Test Sifarişi Yarat
    console.log('\n6️⃣ Testing order creation / Sifariş yaratmanı test edir...');
    const testOrder = await prisma.order.create({
      data: {
        customerId: testUserId,
        sellerId: testData.testProduct.sellerId,
        totalAmount: testData.testProduct.price,
        shippingAddress: JSON.stringify({
          street: 'Test Street',
          city: 'Baku',
          state: 'Baku',
          zipCode: '1000',
          country: 'Azerbaijan'
        }),
        status: 'PENDING'
      }
    });

    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: testOrder.id,
        productId: testProductId,
        quantity: 1,
        price: testData.testProduct.price
      }
    });

    console.log('✅ Test order created / Test sifariş yaradıldı');

    // Test 7: Get Statistics / Test 7: Statistikaları Gətir
    console.log('\n7️⃣ Testing statistics retrieval / Statistika əldə etməni test edir...');
    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        activeUsers,
        pendingOrders
      ] = await Promise.all([
        tx.user.count(),
        tx.product.count(),
        tx.order.count(),
        tx.user.count({ where: { isActive: true } }),
        tx.order.count({ where: { status: 'PENDING' } })
      ]);

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        activeUsers,
        pendingOrders
      };
    });

    console.log('📊 Statistics / Statistikalar:');
    console.log(`  - Total Users: ${stats.totalUsers}`);
    console.log(`  - Active Users: ${stats.activeUsers}`);
    console.log(`  - Total Products: ${stats.totalProducts}`);
    console.log(`  - Total Orders: ${stats.totalOrders}`);
    console.log(`  - Pending Orders: ${stats.pendingOrders}`);

    // Test 8: Cleanup Test Data / Test 8: Test Məlumatlarını Təmizlə
    console.log('\n8️⃣ Cleaning up test data / Test məlumatlarını təmizləyir...');
    
    // Delete test order and items / Test sifarişi və elementləri sil
    await prisma.orderItem.deleteMany({
      where: { orderId: testOrder.id }
    });
    await prisma.order.delete({
      where: { id: testOrder.id }
    });

    // Delete test product / Test məhsulu sil
    await prisma.product.delete({
      where: { id: testProductId }
    });

    // Delete test user / Test istifadəçini sil
    await prisma.user.delete({
      where: { id: testUserId }
    });

    console.log('✅ Test data cleaned up / Test məlumatları təmizləndi');

    console.log('\n🎉 All Admin API tests completed successfully! / Bütün Admin API testləri uğurla tamamlandı!');

  } catch (error) {
    console.error('❌ Admin API test failed / Admin API testi uğursuz oldu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed / Veritabanı bağlantısı bağlandı');
  }
}

// Run the tests / Testləri işə sal
testAdminAPIs();
