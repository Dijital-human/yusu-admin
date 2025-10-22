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
  ShoppingCart, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  User,
  Package,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MapPin
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

interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  courierId?: string;
  status: string;
  totalAmount: number | string;
  shippingAddress: string;
  addressId?: string;
  paymentIntentId?: string;
  paymentStatus?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  courier?: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number | string;
    product: {
      id: string;
      name: string;
      price: number | string;
      images: string;
    };
  }>;
  address?: {
    id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching orders.");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, courierId?: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          orderId, 
          status: newStatus,
          ...(courierId && { courierId })
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      setError(err.message || "An error occurred while updating order status.");
      console.error("Error updating order status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete order");
      }
      
      await fetchOrders(); // Refresh orders
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting order.");
      console.error("Error deleting order:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING_PAYMENT":
        return "bg-orange-100 text-orange-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "PENDING_PAYMENT":
        return <Clock className="h-4 w-4" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4" />;
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      case "PAYMENT_FAILED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending / Gözləyir";
      case "PENDING_PAYMENT":
        return "Pending Payment / Ödəniş Gözləyir";
      case "CONFIRMED":
        return "Confirmed / Təsdiqləndi";
      case "SHIPPED":
        return "Shipped / Göndərildi";
      case "DELIVERED":
        return "Delivered / Çatdırıldı";
      case "CANCELLED":
        return "Cancelled / Ləğv edildi";
      case "PAYMENT_FAILED":
        return "Payment Failed / Ödəniş Uğursuz";
      default:
        return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Management / Sifariş İdarəetməsi</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">Order Management / Sifariş İdarəetməsi</h1>
          <p className="text-gray-600 mt-2">Manage all orders across the platform / Platformdakı bütün sifarişləri idarə edin</p>
        </div>
      </div>

      {/* Search and Filters / Axtarış və Filtrlər */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders... / Sifarişləri axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status / Statusa görə filtr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status / Bütün Statuslar</SelectItem>
                  <SelectItem value="PENDING">Pending / Gözləyir</SelectItem>
                  <SelectItem value="PENDING_PAYMENT">Pending Payment / Ödəniş Gözləyir</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed / Təsdiqləndi</SelectItem>
                  <SelectItem value="SHIPPED">Shipped / Göndərildi</SelectItem>
                  <SelectItem value="DELIVERED">Delivered / Çatdırıldı</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled / Ləğv edildi</SelectItem>
                  <SelectItem value="PAYMENT_FAILED">Payment Failed / Ödəniş Uğursuz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table / Sifarişlər Cədvəli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Orders ({filteredOrders.length}) / Sifarişlər ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order / Sifariş</TableHead>
                  <TableHead>Customer / Müştəri</TableHead>
                  <TableHead>Seller / Satıcı</TableHead>
                  <TableHead>Courier / Kuryer</TableHead>
                  <TableHead>Amount / Məbləğ</TableHead>
                  <TableHead>Status / Status</TableHead>
                  <TableHead>Created / Yaradılıb</TableHead>
                  <TableHead className="text-right">Actions / Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">#{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">{order.items.length} items / element</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.customer.name}</p>
                          <p className="text-sm text-gray-500">{order.customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.seller.name}</p>
                          <p className="text-sm text-gray-500">{order.seller.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.courier ? (
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900">{order.courier.name}</p>
                            <p className="text-sm text-gray-500">{order.courier.email}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned / Təyin edilməyib</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${Number(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} flex items-center w-fit`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusLabel(order.status)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/orders/${order.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details / Detallara Bax
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status / Status Yenilə</DropdownMenuLabel>
                            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
                              status !== order.status && (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Mark as {getStatusLabel(status)}
                                </DropdownMenuItem>
                              )
                            ))}
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
                                    This action will permanently delete order #{order.id.slice(-8)}. This cannot be undone.
                                    Bu əməliyyat sifarişi #{order.id.slice(-8)} daimi olaraq siləcək. Bu geri qaytarıla bilməz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel / Ləğv Et</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteOrder(order.id)} 
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
                      {searchTerm || statusFilter !== "all"
                        ? "No orders found matching your filters / Filtrlərinizə uyğun sifariş tapılmadı" 
                        : "No orders found / Sifariş tapılmadı"
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