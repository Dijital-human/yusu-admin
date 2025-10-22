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
  Users, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Loader2,
  Calendar,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/auth/signin");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching users.");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user role");
      }
      
      await fetchUsers(); // Refresh users
    } catch (err: any) {
      setError(err.message || "An error occurred while updating user role.");
      console.error("Error updating user role:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user status");
      }
      
      await fetchUsers(); // Refresh users
    } catch (err: any) {
      setError(err.message || "An error occurred while updating user status.");
      console.error("Error updating user status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }
      
      await fetchUsers(); // Refresh users
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting user.");
      console.error("Error deleting user:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SELLER":
        return "bg-blue-100 text-blue-800";
      case "COURIER":
        return "bg-green-100 text-green-800";
      case "CUSTOMER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin / Admin";
      case "SELLER":
        return "Seller / Satıcı";
      case "COURIER":
        return "Courier / Kuryer";
      case "CUSTOMER":
        return "Customer / Müştəri";
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="h-4 w-4" />;
      case "SELLER":
        return <Users className="h-4 w-4" />;
      case "COURIER":
        return <Users className="h-4 w-4" />;
      case "CUSTOMER":
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management / İstifadəçi İdarəetməsi</h1>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management / İstifadəçi İdarəetməsi</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions / İstifadəçi hesablarını və icazələrini idarə edin</p>
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
                  placeholder="Search users... / İstifadəçiləri axtar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role / Rola görə filtr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles / Bütün Rollar</SelectItem>
                  <SelectItem value="ADMIN">Admin / Admin</SelectItem>
                  <SelectItem value="SELLER">Seller / Satıcı</SelectItem>
                  <SelectItem value="COURIER">Courier / Kuryer</SelectItem>
                  <SelectItem value="CUSTOMER">Customer / Müştəri</SelectItem>
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

      {/* Users Table / İstifadəçilər Cədvəli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Users ({filteredUsers.length}) / İstifadəçilər ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User / İstifadəçi</TableHead>
                  <TableHead>Role / Rol</TableHead>
                  <TableHead>Contact / Əlaqə</TableHead>
                  <TableHead>Status / Status</TableHead>
                  <TableHead>Joined / Qoşulub</TableHead>
                  <TableHead className="text-right">Actions / Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleColor(user.role)} flex items-center w-fit`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{getRoleLabel(user.role)}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {user.isActive ? (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Active / Aktiv
                            </>
                          ) : (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Inactive / Qeyri-aktiv
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(user.createdAt).toLocaleDateString()}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details / Detallara Bax
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Change Role / Rol Dəyişdir</DropdownMenuLabel>
                            {["ADMIN", "SELLER", "COURIER", "CUSTOMER"].map((role) => (
                              role !== user.role && (
                                <DropdownMenuItem
                                  key={role}
                                  onClick={() => updateUserRole(user.id, role)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Make {getRoleLabel(role)}
                                </DropdownMenuItem>
                              )
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.id, user.isActive)}
                              disabled={isUpdating}
                            >
                              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              {user.isActive ? "Deactivate / Deaktiv et" : "Activate / Aktiv et"}
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
                                    This action will permanently delete user &apos;{user.name}&apos;. This cannot be undone.
                                    Bu əməliyyat istifadəçini &apos;{user.name}&apos; daimi olaraq siləcək. Bu geri qaytarıla bilməz.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel / Ləğv Et</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deleteUser(user.id)} 
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
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                        ? "No users found matching your filters / Filtrlərinizə uyğun istifadəçi tapılmadı" 
                        : "No users found / İstifadəçi tapılmadı"
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