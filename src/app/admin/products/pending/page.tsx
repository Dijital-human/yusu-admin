"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Package,
  Star,
  User,
  Calendar
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PendingProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  stock: number;
  isActive: boolean;
  isPublished: boolean;
  isApproved: boolean;
  publishedAt: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function PendingProductsPage() {
  const [products, setProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadPendingProducts();
  }, [pagination.page, searchTerm, categoryFilter]);

  const loadPendingProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        category: categoryFilter
      });

      const response = await fetch(`/api/admin/products/pending?${params}`);
      if (!response.ok) throw new Error("Failed to fetch pending products");

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message || "Failed to load pending products");
      console.error("Error loading pending products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: "Approved by admin" }),
      });

      if (response.ok) {
        // Reload products
        loadPendingProducts();
        alert("Product approved successfully / Məhsul uğurla təsdiqləndi");
      } else {
        const error = await response.json();
        alert(error.error || "Error approving product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      alert("Error approving product / Məhsul təsdiqləmə xətası");
    }
  };

  const handleReject = async (productId: string) => {
    const reason = prompt("Rejection reason / Rədd səbəbi:");
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/products/${productId}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        // Reload products
        loadPendingProducts();
        alert("Product rejected successfully / Məhsul uğurla rədd edildi");
      } else {
        const error = await response.json();
        alert(error.error || "Error rejecting product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      alert("Error rejecting product / Məhsul rədd etmə xətası");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="animate-pulse rounded-md bg-gray-200 h-8 w-64 mb-2"></div>
            <div className="animate-pulse rounded-md bg-gray-200 h-4 w-96"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="animate-pulse rounded-md bg-gray-200 h-48 w-full mb-4"></div>
                  <div className="animate-pulse rounded-md bg-gray-200 h-4 w-3/4 mb-2"></div>
                  <div className="animate-pulse rounded-md bg-gray-200 h-4 w-1/2 mb-4"></div>
                  <div className="animate-pulse rounded-md bg-gray-200 h-8 w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Pending Products / Təsdiq Gözləyən Məhsullar
              </h1>
              <p className="text-gray-600">
                Review and approve products submitted by sellers.
                / Satıcılar tərəfindən təqdim edilən məhsulları nəzərdən keçirin və təsdiqləyin.
              </p>
            </div>
            <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
              <Clock className="h-4 w-4 mr-1" />
              {pagination.total} Pending
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search products... / Məhsulları axtar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Stock: {product.stock}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{product.category.name}</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Seller Info */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {product.seller.name}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.seller.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        Published: {formatDate(product.publishedAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/admin/products/${product.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(product.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleReject(product.id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Pending Products
              </h3>
              <p className="text-gray-500">
                There are no products waiting for approval.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <span className="flex items-center px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
