/**
 * Cart Component / Səbət Komponenti
 * This component displays the shopping cart with items and controls
 * Bu komponent alış-veriş səbətini elementlər və idarəetmə ilə göstərir
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/CartContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  X,
  Package,
  Truck,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartProps {
  onClose?: () => void;
  showCheckoutButton?: boolean;
}

export function Cart({ onClose, showCheckoutButton = true }: CartProps) {
  const { state, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    setIsUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setIsUpdating(productId);
    try {
      await removeFromCart(productId);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear the cart? / Səbəti təmizləmək istədiyinizə əminsiniz?")) {
      await clearCart();
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading cart... / Səbət yüklənir...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{state.error}</AlertDescription>
      </Alert>
    );
  }

  if (state.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Your cart is empty / Səbətiniz boşdur
        </h3>
        <p className="text-gray-600 mb-4">
          Add some products to get started / Başlamaq üçün bəzi məhsullar əlavə edin
        </p>
        <Link href="/products">
          <Button onClick={onClose}>
            Continue Shopping / Alış-verişə Davam Et
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Header / Səbət Başlığı */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Shopping Cart / Alış-veriş Səbəti
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
            {state.totalItems} {state.totalItems === 1 ? 'item' : 'items'} / {state.totalItems === 1 ? 'element' : 'element'}
          </span>
        </div>
        
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Cart Items / Səbət Elementləri */}
      <div className="space-y-4">
        {state.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                {/* Product Image / Məhsul Şəkli */}
                <Link href={`/products/${item.productId}`} onClick={onClose}>
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.product.images || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-md"
                      sizes="80px"
                    />
                  </div>
                </Link>

                {/* Product Details / Məhsul Təfərrüatları */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`} onClick={onClose}>
                    <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  {item.product.seller && (
                    <p className="text-sm text-gray-500 mt-1">
                      by {item.product.seller.name}
                    </p>
                  )}
                  
                  <div className="flex items-center mt-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(item.product.price)}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      each / hər biri
                    </span>
                  </div>
                </div>

                {/* Quantity Controls / Miqdar İdarəetməsi */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={isUpdating === item.productId || item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-12 text-center">
                    {isUpdating === item.productId ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto" />
                    ) : (
                      <span className="font-medium">{item.quantity}</span>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={isUpdating === item.productId || item.quantity >= item.product.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Item Total / Element Cəmi */}
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.quantity} × {formatCurrency(item.product.price)}
                  </div>
                </div>

                {/* Remove Button / Çıxarma Düyməsi */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleRemoveItem(item.productId)}
                  disabled={isUpdating === item.productId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Stock Warning / Stok Xəbərdarlığı */}
              {item.quantity > item.product.stock && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Only {item.product.stock} items available in stock / Stokda yalnız {item.product.stock} element var
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary / Səbət Xülasəsi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Summary / Sifariş Xülasəsi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subtotal / Alt Cəm */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal / Alt Cəm</span>
            <span className="font-medium">{formatCurrency(state.totalPrice)}</span>
          </div>

          {/* Shipping / Çatdırılma */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping / Çatdırılma</span>
            <span className="font-medium text-green-600">Free / Pulsuz</span>
          </div>

          {/* Tax / Vergi */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax / Vergi</span>
            <span className="font-medium">$0.00</span>
          </div>

          {/* Divider / Ayırıcı */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total / Cəmi</span>
              <span>{formatCurrency(state.totalPrice)}</span>
            </div>
          </div>

          {/* Action Buttons / Əməliyyat Düymələri */}
          <div className="space-y-3 pt-4">
            {showCheckoutButton && (
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg" onClick={onClose}>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Checkout / Ödənişə Keç
                </Button>
              </Link>
            )}
            
            <Button
              variant="outline"
              className="w-full"
              onClick={handleClearCart}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart / Səbəti Təmizlə
            </Button>
          </div>

          {/* Delivery Info / Çatdırılma Məlumatı */}
          <div className="bg-blue-50 p-3 rounded-md">
            <div className="flex items-center space-x-2 text-blue-800">
              <Truck className="h-4 w-4" />
              <span className="text-sm font-medium">Free delivery on orders over $50 / $50-dan yuxarı sifarişlərdə pulsuz çatdırılma</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
