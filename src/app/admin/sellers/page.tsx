/**
 * Admin Sellers Management Page / Admin Satıcı İdarəetməsi Səhifəsi
 * Manage sellers, their permissions, and analytics
 * Satıcıları, onların icazələrini və analitikasını idarə et
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Store,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  BarChart3,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Settings,
  Shield,
  Award,
  Target,
  Zap,
  Activity,
  PieChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  ChevronDown,
  ChevronRight,
  Home,
  Truck,
  CreditCard,
  Gift,
  Tag,
  Award as AwardIcon,
  BookOpen,
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
  GitBranch as Branch,
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
  GitPullRequest as GitPullRequestNew,
  GitPullRequest as GitPullRequestUpdate,
  GitPullRequest as GitPullRequestDraftArrow,
  GitPullRequest as GitPullRequestClosedArrow,
  GitPullRequest as GitPullRequestCreateArrow,
  GitPullRequest as GitPullRequestNewArrow,
  GitPullRequest as GitPullRequestUpdateArrow,
  Upload,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreHorizontal as MoreHorizontalIcon,
} from "lucide-react";

interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  analytics: {
    totalProducts: number;
    totalOrders: number;
    monthlyRevenue: number;
    weeklyRevenue: number;
    dailyRevenue: number;
    categoryStats: Array<{
      categoryId: string;
      productCount: number;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      price: number;
      salesCount: number;
    }>;
  };
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch sellers data / Satıcı məlumatlarını yüklə
  const fetchSellers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const response = await fetch(`/api/admin/sellers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch sellers");

      const data = await response.json();
      setSellers(data.sellers);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching sellers");
      console.error("Sellers fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  // Handle search / Axtarışı idarə et
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle status filter / Status filtrini idarə et
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle category filter / Kateqoriya filtrini idarə et
  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  // Handle seller status toggle / Satıcı statusunu dəyişdir
  const handleToggleStatus = async (sellerId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/sellers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sellerId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update seller status");

      await fetchSellers();
    } catch (err: any) {
      setError(err.message || "Failed to update seller status");
      console.error("Status update error:", err);
    }
  };

  // Handle seller deletion / Satıcı silməni idarə et
  const handleDeleteSeller = async (sellerId: string) => {
    if (!confirm("Are you sure you want to delete this seller?")) return;

    try {
      const response = await fetch(`/api/admin/sellers?id=${sellerId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete seller");

      await fetchSellers();
    } catch (err: any) {
      setError(err.message || "Failed to delete seller");
      console.error("Delete error:", err);
    }
  };

  // Format currency / Valyuta formatla
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date / Tarix formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format number / Rəqəm formatla
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading sellers... / Satıcılar yüklənir...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSellers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry / Yenidən cəhd et
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Sellers Management / Satıcı İdarəetməsi</h1>
          <p className="text-gray-600 mt-1">
            Manage sellers, their permissions, and view analytics / Satıcıları idarə et, icazələrini tənzimlə və analitikaya bax
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export / İxrac et
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm" onClick={fetchSellers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh / Yenilə
          </Button>
        </div>
      </div>

      {/* Filters / Filtrlər */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sellers... / Satıcıları axtar..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status / Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status / Bütün Statuslar</SelectItem>
                <SelectItem value="active">Active / Aktiv</SelectItem>
                <SelectItem value="inactive">Inactive / Qeyri-aktiv</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category / Kateqoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories / Bütün Kateqoriyalar</SelectItem>
                <SelectItem value="electronics">Electronics / Elektronika</SelectItem>
                <SelectItem value="clothing">Clothing / Geyim</SelectItem>
                <SelectItem value="home">Home / Ev</SelectItem>
                <SelectItem value="sports">Sports / İdman</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="justify-start">
              <Filter className="h-4 w-4 mr-2" />
              More Filters / Daha çox filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table / Satıcılar Cədvəli */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Sellers / Satıcılar</CardTitle>
          <p className="text-gray-600">Manage and monitor seller performance / Satıcı performansını idarə et və izlə</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller / Satıcı</TableHead>
                  <TableHead>Contact / Əlaqə</TableHead>
                  <TableHead>Products / Məhsullar</TableHead>
                  <TableHead>Orders / Sifarişlər</TableHead>
                  <TableHead>Revenue / Gəlir</TableHead>
                  <TableHead>Status / Status</TableHead>
                  <TableHead>Actions / Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller) => (
                  <TableRow key={seller.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {seller.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{seller.name}</div>
                          <div className="text-sm text-gray-500">
                            Joined / Qoşulub: {formatDate(seller.createdAt)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{seller.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{seller.phone || "N/A"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {formatNumber(seller.analytics.totalProducts)}
                        </div>
                        <div className="text-sm text-gray-500">Products / Məhsullar</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {formatNumber(seller.analytics.totalOrders)}
                        </div>
                        <div className="text-sm text-gray-500">Orders / Sifarişlər</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(seller.analytics.monthlyRevenue)}
                        </div>
                        <div className="text-sm text-gray-500">Monthly / Aylıq</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          seller.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {seller.isActive ? "Active / Aktiv" : "Inactive / Qeyri-aktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSeller(seller);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(seller.id, seller.isActive)}
                        >
                          {seller.isActive ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions / Əməliyyatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit / Redaktə et
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics / Analitikaya bax
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Permissions / İcazələr
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteSeller(seller.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete / Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination / Səhifələmə */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {sellers.length} of {sellers.length} sellers / {sellers.length} satıcıdan {sellers.length}-i göstərilir
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous / Əvvəlki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next / Növbəti
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller Details Dialog / Satıcı Təfərrüatları Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Details / Satıcı Təfərrüatları</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedSeller?.name} / {selectedSeller?.name} haqqında ətraflı məlumat
            </DialogDescription>
          </DialogHeader>
          {selectedSeller && (
            <div className="space-y-6">
              {/* Basic Info / Əsas Məlumat */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information / Əsas Məlumat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name / Ad</label>
                      <p className="text-gray-900">{selectedSeller.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email / E-poçt</label>
                      <p className="text-gray-900">{selectedSeller.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone / Telefon</label>
                      <p className="text-gray-900">{selectedSeller.phone || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status / Status</label>
                      <Badge
                        className={
                          selectedSeller.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {selectedSeller.isActive ? "Active / Aktiv" : "Inactive / Qeyri-aktiv"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics / Analitika */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analytics / Analitika</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(selectedSeller.analytics.totalProducts)}
                      </div>
                      <div className="text-sm text-blue-500">Total Products / Ümumi Məhsullar</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(selectedSeller.analytics.totalOrders)}
                      </div>
                      <div className="text-sm text-green-500">Total Orders / Ümumi Sifarişlər</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(selectedSeller.analytics.monthlyRevenue)}
                      </div>
                      <div className="text-sm text-purple-500">Monthly Revenue / Aylıq Gəlir</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Products / Ən Yaxşı Məhsullar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Products / Ən Yaxşı Məhsullar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedSeller.analytics.topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{formatCurrency(product.price)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{product.salesCount}</div>
                          <div className="text-sm text-gray-500">Sales / Satış</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close / Bağla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
