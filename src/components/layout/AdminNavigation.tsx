/**
 * Modern Admin Navigation Component / Modern Admin Naviqasiya Komponenti
 * Professional admin panel navigation with modern design
 * Professional admin panel naviqasiyası modern dizayn ilə
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  User,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  FileText,
  Database,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  Zap,
  Layers,
  PieChart,
  Activity,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronDown,
  ChevronRight,
  Home,
  Store,
  Truck,
  CreditCard,
  Gift,
  Tag,
  Award,
  BookOpen,
  HelpCircle,
  Info,
  ExternalLink,
  Copy,
  Share,
  Archive,
  RefreshCw,
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
  Plus,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Palette,
} from "lucide-react";

interface AdminNavigationProps {
  className?: string;
}

export default function AdminNavigation({ className = "" }: AdminNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Main", "Management", "Analytics", "System"
  ]);
  const pathname = usePathname();

  // Navigation items with categories / Naviqasiya elementləri kateqoriyalarla
  const navigationCategories = [
    {
      id: "Main",
      name: "Main",
      nameAz: "Əsas",
      items: [
        {
          name: "Dashboard",
          nameAz: "İdarə Paneli",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          description: "Overview and analytics",
          descriptionAz: "Ümumi baxış və analitika",
          badge: null,
          current: pathname === "/admin/dashboard"
        },
      ],
    },
    {
      id: "Management",
      name: "Management",
      nameAz: "İdarəetmə",
      items: [
        {
          name: "Users",
          nameAz: "İstifadəçilər",
          href: "/admin/users",
          icon: Users,
          description: "User management",
          descriptionAz: "İstifadəçi idarəetməsi",
          badge: "1.2K",
          current: pathname === "/admin/users"
        },
        {
          name: "Sellers",
          nameAz: "Satıcılar",
          href: "/admin/sellers",
          icon: Store,
          description: "Manage sellers and their permissions",
          descriptionAz: "Satıcıları və onların icazələrini idarə et",
          badge: "12",
          current: pathname === "/admin/sellers"
        },
        {
          name: "Couriers",
          nameAz: "Kuryerlər",
          href: "/admin/couriers",
          icon: Truck,
          description: "Manage couriers and deliveries",
          descriptionAz: "Kuryerləri və çatdırılmaları idarə et",
          badge: "8",
          current: pathname === "/admin/couriers"
        },
        {
          name: "Customers",
          nameAz: "Müştərilər",
          href: "/admin/customers",
          icon: Users,
          description: "Manage customers and their data",
          descriptionAz: "Müştəriləri və onların məlumatlarını idarə et",
          badge: "156",
          current: pathname === "/admin/customers"
        },
        {
          name: "Products",
          nameAz: "Məhsullar",
          href: "/admin/products",
          icon: Package,
          description: "Product catalog",
          descriptionAz: "Məhsul kataloqu",
          badge: "5.8K",
          current: pathname === "/admin/products"
        },
        {
          name: "Pending Products",
          nameAz: "Təsdiq Gözləyən Məhsullar",
          href: "/admin/products/pending",
          icon: Clock,
          description: "Products awaiting approval",
          descriptionAz: "Təsdiq gözləyən məhsullar",
          badge: "12",
          current: pathname === "/admin/products/pending"
        },
        {
          name: "Categories",
          nameAz: "Kateqoriyalar",
          href: "/admin/categories",
          icon: Tag,
          description: "Manage product categories",
          descriptionAz: "Məhsul kateqoriyalarını idarə et",
          badge: null,
          current: pathname === "/admin/categories"
        },
        {
          name: "Orders",
          nameAz: "Sifarişlər",
          href: "/admin/orders",
          icon: ShoppingCart,
          description: "Order management",
          descriptionAz: "Sifariş idarəetməsi",
          badge: "342",
          current: pathname === "/admin/orders"
        },
      ],
    },
    {
      id: "Analytics",
      name: "Analytics",
      nameAz: "Analitika",
      items: [
        {
          name: "Analytics",
          nameAz: "Analitika",
          href: "/admin/analytics",
          icon: BarChart3,
          description: "Reports and insights",
          descriptionAz: "Hesabatlar və məlumatlar",
          badge: null,
          current: pathname === "/admin/analytics"
        },
        {
          name: "Reports",
          nameAz: "Hesabatlar",
          href: "/admin/reports",
          icon: FileText,
          description: "Detailed reports",
          descriptionAz: "Ətraflı hesabatlar",
          badge: null,
          current: pathname === "/admin/reports"
        },
        {
          name: "Insights",
          nameAz: "Məlumatlar",
          href: "/admin/insights",
          icon: TrendingUp,
          description: "Business insights",
          descriptionAz: "Biznes məlumatları",
          badge: "New",
          current: pathname === "/admin/insights"
        },
        {
          name: "Performance",
          nameAz: "Performans",
          href: "/admin/performance",
          icon: Activity,
          description: "Performance metrics",
          descriptionAz: "Performans metrikaları",
          badge: null,
          current: pathname === "/admin/performance"
        },
      ],
    },
    {
      id: "System",
      name: "System",
      nameAz: "Sistem",
      items: [
        {
          name: "Settings",
          nameAz: "Tənzimlər",
          href: "/admin/settings",
          icon: Settings,
          description: "System configuration",
          descriptionAz: "Sistem konfiqurasiyası",
          badge: null,
          current: pathname === "/admin/settings"
        },
        {
          name: "Security",
          nameAz: "Təhlükəsizlik",
          href: "/admin/security",
          icon: Shield,
          description: "Security settings",
          descriptionAz: "Təhlükəsizlik tənzimləri",
          badge: null,
          current: pathname === "/admin/security"
        },
        {
          name: "Logs",
          nameAz: "Loglar",
          href: "/admin/logs",
          icon: Database,
          description: "System logs",
          descriptionAz: "Sistem logları",
          badge: null,
          current: pathname === "/admin/logs"
        },
        {
          name: "Notifications",
          nameAz: "Bildirişlər",
          href: "/admin/notifications",
          icon: Bell,
          description: "Notification center",
          descriptionAz: "Bildiriş mərkəzi",
          badge: "3",
          current: pathname === "/admin/notifications"
        },
        {
          name: "Sub-Admins",
          nameAz: "Köməkçi Adminlər",
          href: "/admin/sub-admins",
          icon: Shield,
          description: "Manage sub-admin users",
          descriptionAz: "Köməkçi admin istifadəçilərini idarə et",
          badge: null,
          current: pathname === "/admin/sub-admins"
        },
        {
          name: "Site Design",
          nameAz: "Sayt Dizaynı",
          href: "/admin/site-design",
          icon: Palette,
          description: "Control website design",
          descriptionAz: "Sayt dizaynını idarə et",
          badge: null,
          current: pathname === "/admin/site-design"
        },
        {
          name: "Backup",
          nameAz: "Backup",
          href: "/admin/backup",
          icon: Database,
          description: "Backup and restore",
          descriptionAz: "Backup və bərpa",
          badge: null,
          current: pathname === "/admin/backup"
        },
        {
          name: "User Blocking",
          nameAz: "İstifadəçi Bloklama",
          href: "/admin/user-blocking",
          icon: Lock,
          description: "Block and unblock users",
          descriptionAz: "İstifadəçiləri blokla və blokdan çıxar",
          badge: null,
          current: pathname === "/admin/user-blocking"
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleLogout = () => {
    // Implement logout logic / Logout məntiqini tətbiq et
    console.log("Logout clicked / Logout kliklendi");
  };

  return (
    <>
      {/* Mobile menu button / Mobil menyu düyməsi */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg border-0"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay / Mobil örtük */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation sidebar / Naviqasiya yan paneli */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${className}
      `}>
        <div className="flex flex-col h-full">
          {/* Header / Başlıq */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Yusu Admin</h1>
                <p className="text-sm text-slate-400">Management Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search / Axtarış */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search... / Axtar..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Navigation items / Naviqasiya elementləri */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            {navigationCategories.map((category) => (
              <div key={category.id} className="mb-6">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium uppercase tracking-wider">
                    {category.name} / {category.nameAz}
                  </span>
                  {expandedCategories.includes(category.id) ? (
                    <ChevronDown className="h-4 w-4 group-hover:text-white" />
                  ) : (
                    <ChevronRight className="h-4 w-4 group-hover:text-white" />
                  )}
                </button>
                
                {expandedCategories.includes(category.id) && (
                  <div className="mt-2 space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`group flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
                            item.current
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                              : "text-slate-300 hover:text-white hover:bg-slate-700"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 ${item.current ? "text-white" : "text-slate-400"}`} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs opacity-75">{item.description}</div>
                            </div>
                          </div>
                          {item.badge && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              item.current
                                ? "bg-white/20 text-white"
                                : "bg-slate-600 text-slate-300"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Quick Actions / Sürətli Əməliyyatlar */}
          <div className="p-4 border-t border-slate-700">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Plus className="h-4 w-4 mr-3" />
                Quick Add / Sürətli Əlavə
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-3" />
                Export Data / Məlumat İxracı
              </Button>
            </div>
          </div>

          {/* User Profile / İstifadəçi Profili */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Admin User</div>
                <div className="text-xs text-slate-400">admin@yusu.com</div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout / Çıxış
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}