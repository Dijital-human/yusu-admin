"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  User,
  Edit,
  Trash2,
  Plus,
  AlertCircle
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }

    fetchProducts();
  }, [session, status, router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching products.");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        throw new Error("Failed to update product status");
      }
      
      await fetchProducts(); // Refresh products
    } catch (err: any) {
      setError(err.message || "An error occurred while updating product status.");
      console.error("Error updating product status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }
      
      await fetchProducts(); // Refresh products
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting product.");
      console.error("Error deleting product:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.seller.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || product.category.id === categoryFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Management / Məhsul İdarəetməsi</h1>
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-red-600">
        <h1 className="text-3xl font-bold mb-4">Error / Xəta</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header / Başlıq */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management / Məhsul İdarəetməsi</h1>
          <p className="text-gray-600 mt-2">Manage all products across the platform / Platformdakı bütün məhsulları idarə edin</p>
        </div>
        <Button onClick={() => router.push("/admin/products/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product / Məhsul Əlavə Et
        </Button>
      </div>

      {/* Search and Filters / Axtarış və Filtrlər */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products... / Məhsulları axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category / Kateqoriyaya görə filtr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories / Bütün Kateqoriyalar</SelectItem>
                  {/* Categories will be populated from API */}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status / Statusa görə filtr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status / Bütün Statuslar</SelectItem>
                  <SelectItem value="active">Active / Aktiv</SelectItem>
                  <SelectItem value="inactive">Inactive / Qeyri-aktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table / Məhsullar Cədvəli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Products ({filteredProducts.length}) / Məhsullar ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product / Məhsul</TableHead>
                  <TableHead>Category / Kateqoriya</TableHead>
                  <TableHead>Seller / Satıcı</TableHead>
                  <TableHead>Price / Qiymət</TableHead>
                  <TableHead>Stock / Stok</TableHead>
                  <TableHead>Status / Status</TableHead>
                  <TableHead>Created / Yaradılıb</TableHead>
                  <TableHead className="text-right">Actions / Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{product.seller.name}</p>
                          <p className="text-sm text-gray-500">{product.seller.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-gray-400" />
                          {product.stock}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {product.isActive ? "Active / Aktiv" : "Inactive / Qeyri-aktiv"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions / Əməliyyatlar</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details / Detallara Bax
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit / Redaktə Et
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleProductStatus(product.id, product.isActive)}
                              disabled={isUpdating}
                            >
                              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {product.isActive ? "Deactivate / Deaktiv et" : "Activate / Aktiv et"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete / Sil
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure? / Tamamilə əminsiniz?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action will permanently delete product &apos;{product.name}&apos;. This cannot be undone.
                                    Bu əməliyyat məhsulu &apos;{product.name}&apos; daimi olaraq siləcək. Bu geri qaytarıla bilməz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel / Ləğv Et</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteProduct(product.id)} 
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Delete / Sil
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                        ? "No products found matching your filters / Filtrlərinizə uyğun məhsul tapılmadı" 
                        : "No products found / Məhsul tapılmadı"
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}