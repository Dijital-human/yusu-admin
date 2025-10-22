/**
 * Admin Password Recovery Page / Admin Parol Bərpası Səhifəsi
 * This page handles admin password recovery
 * Bu səhifə admin parol bərpasını idarə edir
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Shield, AlertCircle, CheckCircle, Key, Eye, EyeOff, Copy } from 'lucide-react';

export default function AdminRecoveryPage() {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/admin-recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          recoveryCode, 
          masterKey, 
          newPassword: newPassword || undefined 
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Password recovered successfully! / Parol uğurla bərpa edildi!');
        setGeneratedPassword(data.newPassword);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Recovery failed. Please try again. / Bərpa uğursuz. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard! / Panoya kopyalandı!');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Password Recovery / Admin Parol Bərpası
            </h1>
            <p className="text-gray-600">
              Recover your admin password using recovery codes / Bərpa kodları ilə admin parolunuzu bərpa edin
            </p>
          </div>

          {/* Recovery Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-red-600">
                Password Recovery / Parol Bərpası
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Recovery Code Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recovery Code / Bərpa Kodu
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter recovery code / Bərpa kodunu daxil edin"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                    className="w-full"
                  />
                </div>

                {/* Master Key Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Master Key / Master Açar
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter master key / Master açarı daxil edin"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (Optional) / Yeni Parol (İstəyə bağlı)
                  </label>
                  <Input
                    type="password"
                    placeholder="Leave empty for auto-generated / Avtomatik yaradılması üçün boş buraxın"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Recovering... / Bərpa edilir...' : 'Recover Password / Parolu Bərpa Et'}
                </Button>
              </form>

              {/* Generated Password Display */}
              {generatedPassword && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    New Admin Password / Yeni Admin Parolu:
                  </h3>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                      {generatedPassword}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedPassword)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Save this password securely! / Bu parolu təhlükəsiz yerdə saxlayın!
                  </p>
                </div>
              )}

              {/* Recovery Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Recovery Information / Bərpa Məlumatları:
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Admin Email:</strong> famil.mustafayev.099@gmail.com</p>
                  <p><strong>Recovery Codes:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>YUSU2024ADMIN001</li>
                    <li>YUSU2024ADMIN002</li>
                    <li>YUSU2024ADMIN003</li>
                    <li>YUSU2024ADMIN004</li>
                    <li>YUSU2024ADMIN005</li>
                  </ul>
                  <p><strong>Master Key:</strong> YusuMasterRecovery2024SecretKey123456789</p>
                </div>
              </div>

              {/* Back to Login */}
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/admin-login')}
                  className="w-full"
                >
                  Back to Admin Login / Admin Girişinə Qayıt
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
