"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  Truck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  UserX,
  Loader2,
  Eye,
  Settings,
  BarChart3,
  AlertCircle
} from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingOrders: number;
  completedOrders: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }

    fetchAdminData();
  }, [session, status, router]);

  const fetchAdminData = async () => {
    try {
      // Fetch Stats
      const statsRes = await fetch("/api/admin/stats");
      if (!statsRes.ok) throw new Error("Failed to fetch admin stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Recent Activity
      const activityRes = await fetch("/api/admin/activity?limit=5");
      if (!activityRes.ok) throw new Error("Failed to fetch recent activity");
      const activityData = await activityRes.json();
      setRecentActivity(activityData.activities);

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
      console.error("Admin Dashboard Data Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard / Admin İdarə Paneli</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSkeleton />
            <TableSkeleton />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-red-600">
          <h1 className="text-3xl font-bold mb-4">Error / Xəta</h1>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard / Admin İdarə Paneli</h1>

        {/* Stats Cards / Statistika Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users / Ümumi İstifadəçilər */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users / Ümumi İstifadəçilər</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(stats?.userGrowth || 0)}
                    <span className={`text-sm ml-1 ${getGrowthColor(stats?.userGrowth || 0)}`}>
                      {Math.abs(stats?.userGrowth || 0)}% from last month
                    </span>
                  </div>
                </div>
                <Users className="h-12 w-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Products / Ümumi Məhsullar */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products / Ümumi Məhsullar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                  <div className="flex items-center mt-2">
                    <Badge className="bg-green-100 text-green-800">
                      {stats?.activeUsers || 0} Active / Aktiv
                    </Badge>
                  </div>
                </div>
                <Package className="h-12 w-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Orders / Ümumi Sifarişlər */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders / Ümumi Sifarişlər</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(stats?.orderGrowth || 0)}
                    <span className={`text-sm ml-1 ${getGrowthColor(stats?.orderGrowth || 0)}`}>
                      {Math.abs(stats?.orderGrowth || 0)}% from last month
                    </span>
                  </div>
                </div>
                <ShoppingCart className="h-12 w-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue / Ümumi Gəlir */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue / Ümumi Gəlir</p>
                  <p className="text-3xl font-bold text-gray-900">${stats?.totalRevenue?.toFixed(2) || "0.00"}</p>
                  <div className="flex items-center mt-2">
                    {getGrowthIcon(stats?.revenueGrowth || 0)}
                    <span className={`text-sm ml-1 ${getGrowthColor(stats?.revenueGrowth || 0)}`}>
                      {Math.abs(stats?.revenueGrowth || 0)}% from last month
                    </span>
                  </div>
                </div>
                <DollarSign className="h-12 w-12 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Sürətli Əməliyyatlar */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions / Sürətli Əməliyyatlar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/admin/users")}
            >
              <Users className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">Manage Users / İstifadəçiləri İdarə Et</div>
                <div className="text-sm opacity-90">İstifadəçi rollarını və icazələrini idarə et</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/admin/products")}
            >
              <Package className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">Manage Products / Məhsulları İdarə Et</div>
                <div className="text-sm opacity-90">Bütün məhsulları gör və idarə et</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/admin/orders")}
            >
              <ShoppingCart className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">Manage Orders / Sifarişləri İdarə Et</div>
                <div className="text-sm opacity-90">Bütün sifarişləri gör və idarə et</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-center p-6 h-auto"
              onClick={() => router.push("/admin/settings")}
            >
              <Settings className="h-6 w-6 mr-2" />
              <div className="text-left">
                <div className="font-medium">System Settings / Sistem Tənzimləmələri</div>
                <div className="text-sm opacity-90">Sistem parametrlərini tənzimlə</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Main Content / Əsas Məzmun */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity / Son Fəaliyyətlər */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity / Son Fəaliyyətlər</CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/admin/activity")}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All / Hamısına Bax
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {activity.type === "user" && <UserCheck className="h-5 w-5 text-blue-500" />}
                        {activity.type === "order" && <ShoppingCart className="h-5 w-5 text-green-500" />}
                        {activity.type === "product" && <Package className="h-5 w-5 text-purple-500" />}
                        {activity.type === "system" && <Settings className="h-5 w-5 text-gray-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                        <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No recent activity / Son fəaliyyət yoxdur.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status / Sistem Statusu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Status / Sistem Statusu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Users / Aktiv İstifadəçilər:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats?.activeUsers || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inactive Users / Qeyri-aktiv İstifadəçilər:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {stats?.inactiveUsers || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Orders / Gözləyən Sifarişlər:</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {stats?.pendingOrders || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed Orders / Tamamlanmış Sifarişlər:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {stats?.completedOrders || 0}
                  </Badge>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System Health / Sistem Sağlamlığı:</span>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-600">Healthy / Sağlam</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}