"use client";

import { useState } from "react";
import Button from "@/app/components/ui/button";

export default function BalancePage() {
  const [balance, setBalance] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState<null | string>(null);

  const checkBalance = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/mpesa/balance", {
        method: "GET",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch balance");
      }
      
      setBalance(data.balance);
      setLastChecked(new Date().toLocaleString());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Account Balance</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Your M-PESA Balance</h2>
          <p className="text-gray-600">
            Check your current M-PESA account balance.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center p-8 border border-gray-200 rounded-lg mb-6">
          {balance ? (
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                KES {balance}
              </div>
              <div className="text-sm text-gray-500">
                Last checked: {lastChecked}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Balance will appear here
            </div>
          )}
        </div>
        
        <Button
          onClick={checkBalance}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Checking..." : "Check Balance"}
        </Button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h3 className="font-medium mb-2">About Account Balance</h3>
        <p>
          The Account Balance API allows you to check the balance of your M-PESA account.
          This is useful for reconciliation and monitoring your available funds.
        </p>
      </div>
    </div>
  );
}