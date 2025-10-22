/**
 * Modern Admin Dashboard Page / Modern Admin Dashboard Səhifəsi
 * Professional admin control panel with modern design
 * Professional admin idarə paneli modern dizayn ilə
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatsCardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Globe,
  Shield,
  Bell,
  UserCheck,
  ShoppingBag,
  CreditCard,
  Truck,
  Store,
  Layers,
  FileText,
  Database,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Star as StarIcon,
  MessageSquare as MessageSquareIcon,
  HelpCircle,
  Info,
  ExternalLink,
  Copy,
  Share,
  Archive,
  Save,
  Send,
  Lock,
  Unlock,
  EyeOff,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Move,
  Grid,
  List,
  Columns,
  Rows,
  Layout,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Split,
  Combine,
  Merge,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  GitCompare,
  GitBranchPlus,
  GitCommitHorizontal,
  GitPullRequestDraft,
  GitPullRequestClosed,
  GitPullRequestArrow,
  GitPullRequestCreate,
  Upload,
  MoreHorizontal,
  Home,
  Gift,
  Tag,
  BookOpen,
  PieChart,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  userGrowth: number;
  productGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  activeUsers: number;
  pendingOrders: number;
  completedOrders: number;
  totalCategories: number;
  totalSellers: number;
  totalCouriers: number;
  averageOrderValue: number;
  conversionRate: number;
  customerSatisfaction: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  paymentMethod: string;
  shippingAddress: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface QuickAction {
  title: string;
  titleAz: string;
  description: string;
  descriptionAz: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  textColor: string;
  badge?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick actions / Sürətli əməliyyatlar
  const quickActions: QuickAction[] = [
    {
      title: "Add Product",
      titleAz: "Məhsul Əlavə Et",
      description: "Add new product to catalog",
      descriptionAz: "Kataloqa yeni məhsul əlavə et",
      icon: Package,
      href: "/admin/products/new",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      badge: "New",
    },
    {
      title: "Manage Users",
      titleAz: "İstifadəçiləri İdarə Et",
      description: "View and manage user accounts",
      descriptionAz: "İstifadəçi hesablarını görüntülə və idarə et",
      icon: Users,
      href: "/admin/users",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Process Orders",
      titleAz: "Sifarişləri İşlə",
      description: "Process and manage orders",
      descriptionAz: "Sifarişləri işlə və idarə et",
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "View Analytics",
      titleAz: "Analitikaya Bax",
      description: "View detailed analytics and reports",
      descriptionAz: "Ətraflı analitika və hesabatları görüntülə",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Manage Categories",
      titleAz: "Kateqoriyaları İdarə Et",
      description: "Organize product categories",
      descriptionAz: "Məhsul kateqoriyalarını təşkil et",
      icon: Layers,
      href: "/admin/categories",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      title: "System Settings",
      titleAz: "Sistem Tənzimləri",
      description: "Configure system settings",
      descriptionAz: "Sistem tənzimlərini konfiqurasiya et",
      icon: Settings,
      href: "/admin/settings",
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
    },
  ];

  // Fetch admin data / Admin məlumatlarını yüklə
  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      if (!statsRes.ok) throw new Error("Failed to fetch admin stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent orders
      const ordersRes = await fetch("/api/admin/orders?limit=5");
      if (!ordersRes.ok) throw new Error("Failed to fetch recent orders");
      const ordersData = await ordersRes.json();
      setRecentOrders(ordersData.orders || []);

    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data.");
      console.error("Admin Dashboard Data Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Helper functions / Yardımçı funksiyalar
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending / Gözləyir";
      case "PROCESSING":
        return "Processing / İşlənir";
      case "SHIPPED":
        return "Shipped / Göndərilib";
      case "DELIVERED":
        return "Delivered / Çatdırılıb";
      case "CANCELLED":
        return "Cancelled / Ləğv edilib";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "PROCESSING":
        return <Activity className="h-4 w-4" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAdminData} variant="outline" className="shadow-sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry / Yenidən cəhd et
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-gray-200 rounded-full animate-pulse"></div>
            <p className="text-gray-600">No data available / Məlumat mövcud deyil</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header / Başlıq */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your store today. / 
            Xoş gəlmisiniz! Bu gün mağazanızda nələr baş verir.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export / İxrac et
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm" onClick={fetchAdminData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh / Yenilə
          </Button>
        </div>
      </div>

      {/* Main Stats Cards / Əsas Statistik Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Users / Ümumi İstifadəçilər</CardTitle>
            <Users className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.totalUsers)}</div>
            <div className="flex items-center text-sm text-blue-100 mt-2">
              {stats.userGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300 mr-1" />
              )}
              <span className={stats.userGrowth > 0 ? "text-green-300" : "text-red-300"}>
                {Math.abs(stats.userGrowth)}% from last month / keçən aydan
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Products / Ümumi Məhsullar</CardTitle>
            <Package className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.totalProducts)}</div>
            <div className="flex items-center text-sm text-green-100 mt-2">
              {stats.productGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300 mr-1" />
              )}
              <span className={stats.productGrowth > 0 ? "text-green-300" : "text-red-300"}>
                {Math.abs(stats.productGrowth)}% from last month / keçən aydan
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Orders / Ümumi Sifarişlər</CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatNumber(stats.totalOrders)}</div>
            <div className="flex items-center text-sm text-purple-100 mt-2">
              {stats.orderGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300 mr-1" />
              )}
              <span className={stats.orderGrowth > 0 ? "text-green-300" : "text-red-300"}>
                {Math.abs(stats.orderGrowth)}% from last month / keçən aydan
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Total Revenue / Ümumi Gəlir</CardTitle>
            <DollarSign className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            <div className="flex items-center text-sm text-orange-100 mt-2">
              {stats.revenueGrowth > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-300 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-300 mr-1" />
              )}
              <span className={stats.revenueGrowth > 0 ? "text-green-300" : "text-red-300"}>
                {Math.abs(stats.revenueGrowth)}% from last month / keçən aydan
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Cards / İkincil Statistik Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users / Aktiv İstifadəçilər</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeUsers || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Currently online / Hal-hazırda onlayn</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders / Gözləyən Sifarişlər</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.pendingOrders || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting processing / İşlənməni gözləyir</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Orders / Tamamlanmış Sifarişlər</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.completedOrders || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Successfully delivered / Uğurla çatdırılıb</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Order Value / Orta Sifariş Dəyəri</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageOrderValue || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Per order / Sifariş başına</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / Sürətli Əməliyyatlar */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions / Sürətli Əməliyyatlar</CardTitle>
          <p className="text-gray-600">Access frequently used features quickly / Tez-tez istifadə olunan funksiyalara sürətli giriş</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-6 flex flex-col items-start space-y-3 hover:shadow-md transition-all duration-200 border-0 bg-white hover:bg-gray-50"
                asChild
              >
                <a href={action.href}>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 flex items-center">
                      {action.title}
                      {action.badge && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{action.description}</div>
                  </div>
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders / Son Sifarişlər */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Recent Orders / Son Sifarişlər</CardTitle>
          <p className="text-gray-600">Latest customer orders and their status / Son müştəri sifarişləri və onların statusu</p>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{order.customerName}</div>
                      <div className="text-sm text-gray-600">{order.customerEmail}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(order.total)}</div>
                      <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1 mt-1`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusLabel(order.status)}</span>
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No recent orders / Son sifarişlər yoxdur</p>
              <p className="text-gray-500 text-sm mt-2">Orders will appear here once customers start placing them / Müştərilər sifariş verməyə başladıqda sifarişlər burada görünəcək</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}