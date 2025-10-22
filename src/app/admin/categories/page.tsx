/**
 * Admin Categories Management Page / Admin Kateqoriya İdarəetməsi Səhifəsi
 * Manage product categories with full control
 * Məhsul kateqoriyalarını tam nəzarətlə idarə et
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Package,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Image,
  Settings,
  Copy,
  Move,
  Archive,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Target,
  Award,
  Shield,
  Lock,
  Unlock,
  EyeOff,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
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
  GitPullRequestCreateArrow,
  Upload,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreHorizontal as MoreHorizontalIcon,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
  };
  children?: Category[];
  _count: {
    products: number;
    children: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form states / Form vəziyyətləri
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parentId: "",
    isActive: true,
    sortOrder: 0,
    metaTitle: "",
    metaDescription: "",
    keywords: [] as string[],
    icon: "",
    color: "#3B82F6",
  });

  // Fetch categories data / Kateqoriya məlumatlarını yüklə
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        includeProducts: "true",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(parentFilter && { parentId: parentFilter }),
      });

      const response = await fetch(`/api/admin/categories?${params}`);
      if (!response.ok) throw new Error("Failed to fetch categories");

      const data = await response.json();
      setCategories(data.categories);
      setFlatCategories(data.flatCategories);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching categories");
      console.error("Categories fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, parentFilter]);

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

  // Handle parent filter / Ana kateqoriya filtrini idarə et
  const handleParentFilter = (value: string) => {
    setParentFilter(value);
    setCurrentPage(1);
  };

  // Toggle category expansion / Kateqoriya genişlənməsini dəyişdir
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle category status toggle / Kateqoriya statusunu dəyişdir
  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error("Failed to update category status");

      await fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to update category status");
      console.error("Status update error:", err);
    }
  };

  // Handle category deletion / Kateqoriya silməni idarə et
  const handleDeleteCategory = async (categoryId: string, force: boolean = false) => {
    const message = force 
      ? "Are you sure you want to permanently delete this category? This will move all products and subcategories to the parent category."
      : "Are you sure you want to delete this category? This will fail if it has products or subcategories.";
    
    if (!confirm(message)) return;

    try {
      const params = new URLSearchParams({ id: categoryId });
      if (force) params.append("force", "true");

      const response = await fetch(`/api/admin/categories?${params}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete category");
      }

      await fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
      console.error("Delete error:", err);
    }
  };

  // Handle create category / Kateqoriya yaratmağı idarə et
  const handleCreateCategory = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create category");

      await fetchCategories();
      setIsCreateOpen(false);
      setFormData({
        name: "",
        description: "",
        image: "",
        parentId: "",
        isActive: true,
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        icon: "",
        color: "#3B82F6",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create category");
      console.error("Create error:", err);
    }
  };

  // Handle edit category / Kateqoriya redaktə etməni idarə et
  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    try {
      const response = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: selectedCategory.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update category");

      await fetchCategories();
      setIsEditOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      setError(err.message || "Failed to update category");
      console.error("Update error:", err);
    }
  };

  // Open edit dialog / Redaktə dialogunu aç
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
      parentId: category.parentId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      keywords: category.keywords || [],
      icon: category.icon || "",
      color: category.color || "#3B82F6",
    });
    setIsEditOpen(true);
  };

  // Render category tree / Kateqoriya ağacını render et
  const renderCategoryTree = (categories: Category[], level: number = 0) => {
    return categories.map((category) => (
      <div key={category.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell style={{ paddingLeft: `${level * 20 + 16}px` }}>
            <div className="flex items-center space-x-2">
              {category.children && category.children.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="p-1 h-6 w-6"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex items-center space-x-2">
                {category.icon ? (
                  <span className="text-lg">{category.icon}</span>
                ) : (
                  <Folder className="h-4 w-4 text-gray-400" />
                )}
                <span className="font-medium">{category.name}</span>
                {category.parent && (
                  <span className="text-sm text-gray-500">
                    (under {category.parent.name})
                  </span>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-8 h-8 rounded object-cover"
                />
              )}
              <span className="text-sm text-gray-600 truncate max-w-32">
                {category.description || "No description"}
              </span>
            </div>
          </TableCell>
          <TableCell>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {category._count.products}
              </div>
              <div className="text-sm text-gray-500">Products</div>
            </div>
          </TableCell>
          <TableCell>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {category._count.children}
              </div>
              <div className="text-sm text-gray-500">Subcategories</div>
            </div>
          </TableCell>
          <TableCell>
            <Badge
              className={
                category.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory(category);
                  setIsDetailsOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(category.id, category.isActive)}
              >
                {category.isActive ? (
                  <EyeOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Eye className="h-4 w-4 text-green-500" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openEditDialog(category)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Move className="h-4 w-4 mr-2" />
                    Move
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteCategory(category.id, true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Force Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
        {expandedCategories.has(category.id) && category.children && (
          <>{renderCategoryTree(category.children, level + 1)}</>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading categories... / Kateqoriyalar yüklənir...</p>
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
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCategories} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">Categories Management / Kateqoriya İdarəetməsi</h1>
          <p className="text-gray-600 mt-1">
            Manage product categories and their hierarchy / Məhsul kateqoriyalarını və onların iyerarxiyasını idarə et
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export / İxrac et
          </Button>
          <Button variant="outline" size="sm" className="shadow-sm" onClick={fetchCategories}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh / Yenilə
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            New Category / Yeni Kateqoriya
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
                placeholder="Search categories... / Kateqoriyaları axtar..."
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
            <Select value={parentFilter} onValueChange={handleParentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Parent Category / Ana Kateqoriya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories / Bütün Kateqoriyalar</SelectItem>
                <SelectItem value="">Root Categories / Kök Kateqoriyalar</SelectItem>
                {flatCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="justify-start">
              <Filter className="h-4 w-4 mr-2" />
              More Filters / Daha çox filtr
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table / Kateqoriyalar Cədvəli */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">Categories / Kateqoriyalar</CardTitle>
          <p className="text-gray-600">Manage and organize product categories / Məhsul kateqoriyalarını idarə et və təşkil et</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category / Kateqoriya</TableHead>
                  <TableHead>Description / Təsvir</TableHead>
                  <TableHead>Products / Məhsullar</TableHead>
                  <TableHead>Subcategories / Alt Kateqoriyalar</TableHead>
                  <TableHead>Status / Status</TableHead>
                  <TableHead>Actions / Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderCategoryTree(categories)}
              </TableBody>
            </Table>
          </div>

          {/* Pagination / Səhifələmə */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500">
              Showing {flatCategories.length} of {flatCategories.length} categories / {flatCategories.length} kateqoriyadan {flatCategories.length}-i göstərilir
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

      {/* Create Category Dialog / Kateqoriya Yaratma Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Category / Yeni Kateqoriya Yarat</DialogTitle>
            <DialogDescription>
              Add a new product category to organize your products / Məhsullarınızı təşkil etmək üçün yeni məhsul kateqoriyası əlavə edin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name / Ad *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name / Kateqoriya adını daxil edin"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Parent Category / Ana Kateqoriya</label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category / Ana kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Root Category / Kök Kateqoriya</SelectItem>
                    {flatCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description / Təsvir</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description / Kateqoriya təsvirini daxil edin"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Icon / İkon</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏷️"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Color / Rəng</label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Sort Order / Sıralama Sırası</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active / Aktiv
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel / Ləğv et
            </Button>
            <Button onClick={handleCreateCategory}>
              Create Category / Kateqoriya Yarat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog / Kateqoriya Redaktə Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category / Kateqoriya Redaktə Et</DialogTitle>
            <DialogDescription>
              Update category information / Kateqoriya məlumatlarını yenilə
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Name / Ad *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name / Kateqoriya adını daxil edin"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Parent Category / Ana Kateqoriya</label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category / Ana kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Root Category / Kök Kateqoriya</SelectItem>
                    {flatCategories.filter(c => c.id !== selectedCategory?.id).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description / Təsvir</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description / Kateqoriya təsvirini daxil edin"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Icon / İkon</label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🏷️"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Color / Rəng</label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Sort Order / Sıralama Sırası</label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700">
                  Active / Aktiv
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel / Ləğv et
            </Button>
            <Button onClick={handleEditCategory}>
              Update Category / Kateqoriyanı Yenilə
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Details Dialog / Kateqoriya Təfərrüatları Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Category Details / Kateqoriya Təfərrüatları</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedCategory?.name} / {selectedCategory?.name} haqqında ətraflı məlumat
            </DialogDescription>
          </DialogHeader>
          {selectedCategory && (
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
                      <p className="text-gray-900">{selectedCategory.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status / Status</label>
                      <Badge
                        className={
                          selectedCategory.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {selectedCategory.isActive ? "Active / Aktiv" : "Inactive / Qeyri-aktiv"}
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Parent Category / Ana Kateqoriya</label>
                      <p className="text-gray-900">{selectedCategory.parent?.name || "Root / Kök"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Sort Order / Sıralama Sırası</label>
                      <p className="text-gray-900">{selectedCategory.sortOrder}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Description / Təsvir</label>
                      <p className="text-gray-900">{selectedCategory.description || "No description / Təsvir yoxdur"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics / Statistika */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics / Statistika</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCategory._count.products}
                      </div>
                      <div className="text-sm text-blue-500">Products / Məhsullar</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCategory._count.children}
                      </div>
                      <div className="text-sm text-green-500">Subcategories / Alt Kateqoriyalar</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedCategory.createdAt ? new Date(selectedCategory.createdAt).toLocaleDateString() : "N/A"}
                      </div>
                      <div className="text-sm text-purple-500">Created / Yaradılıb</div>
                    </div>
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
