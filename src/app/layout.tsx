import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import AdminNavigation from "@/components/layout/AdminNavigation";

export const metadata: Metadata = {
  title: "Yusu Admin Panel - Admin Dashboard",
  description: "Yusu Admin Panel - Manage your e-commerce platform with powerful admin tools.",
  keywords: "admin, dashboard, ecommerce management, admin panel",
  authors: [{ name: "Yusu Admin Team" }],
  openGraph: {
    title: "Yusu Admin Panel - Admin Dashboard",
    description: "Manage your e-commerce platform with powerful admin tools.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SessionProvider>
          <div className="flex h-screen bg-gray-50">
            {/* Admin Navigation / Admin Naviqasiya */}
            <AdminNavigation />
            
            {/* Main Content / Əsas Məzmun */}
            <main className="flex-1 lg:ml-64 overflow-auto">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
