"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "fas fa-home" },
    { name: "B2C", path: "/dashboard/b2c", icon: "fas fa-money-bill-wave" },
    { name: "Balance", path: "/dashboard/balance", icon: "fas fa-wallet" },
    { name: "STK Push", path: "/dashboard/stkpush", icon: "fas fa-mobile-alt" },
    { name: "Transactions", path: "/dashboard/transactions", icon: "fas fa-history" },
    { name: "Settings", path: "/dashboard/settings", icon: "fas fa-cog" },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div
      className={`bg-white shadow-md transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } min-h-screen`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          {!collapsed && (
            <Link href="/dashboard">
              <div className="flex items-center">
                <Image
                  src="/mpesa.svg"
                  alt="MPESA Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <h1 className="text-xl font-bold text-green-600">MPESA</h1>
              </div>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard">
              <Image
                src="/mpesa.svg"
                alt="MPESA Logo"
                width={40}
                height={40}
                className="mx-auto"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            <i className={`fas ${collapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
          </button>
        </div>

        <nav className="mt-6 flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="px-2 py-1">
                <Link
                  href={item.path}
                  className={`flex items-center p-3 rounded-md ${
                    isActive(item.path)
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <i className={`${item.icon} ${collapsed ? "text-lg" : "mr-3"}`}></i>
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center p-3 text-red-500 hover:bg-red-50 rounded-md w-full"
          >
            <i className={`fas fa-sign-out-alt ${collapsed ? "text-lg" : "mr-3"}`}></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}