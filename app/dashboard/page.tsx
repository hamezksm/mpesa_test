"use client";

import { useEffect, useState } from "react";
import DashboardCard from "../components/dashboard/DashboardCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [recentTransactions, setRecentTransactions] = useState([]);
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Only fetch if authenticated
    if (isAuthenticated && user) {
      // Example API call
      fetch('/api/transactions')
        .then(res => res.json())
        .then(data => setRecentTransactions(data))
        .catch(err => console.error('Error fetching transactions:', err));
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Welcome, {user?.name || user?.username}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="B2C Transfers"
          value="Send money directly to customers"
          icon="cash"
          linkTo="/dashboard/b2c"
          color="green"
        />
        
        <DashboardCard
          title="Account Balance"
          value="Check your current balance"
          icon="wallet"
          linkTo="/dashboard/balance"
          color="blue"
        />
        
        <DashboardCard
          title="STK Push"
          value="Request payments from customers"
          icon="phone"
          linkTo="/dashboard/stkpush"
          color="purple"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Transactions</h2>
        
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500">No recent transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            {/* Transaction table would go here */}
            <p>Transaction history will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}