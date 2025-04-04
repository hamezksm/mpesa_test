"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

export default function B2CPage() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    amount: "",
    reason: "SalaryPayment", // Default reason
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
//   const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/mpesa/b2c", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "B2C transfer failed");
      }

      setSuccess("B2C transfer initiated successfully!");
      setFormData({ ...formData, phoneNumber: "", amount: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">B2C Money Transfer</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-600 mb-4">
          Send money directly from your business to a customer&apos;s M-PESA account.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            name="phoneNumber"
            type="tel"
            placeholder="254712345678"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          
          <Input
            label="Amount (KES)"
            name="amount"
            type="number"
            placeholder="1000"
            value={formData.amount}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-gray-700 mb-1">Reason</label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="SalaryPayment">Salary Payment</option>
              <option value="BusinessPayment">Business Payment</option>
              <option value="PromotionPayment">Promotion Payment</option>
            </select>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Send Money"}
          </Button>
        </form>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h3 className="font-medium mb-2">About B2C Transfers</h3>
        <p>
          B2C API enables the business to make payments to customers directly to their M-PESA registered mobile numbers.
          The maximum transaction amount is KES 70,000.
        </p>
      </div>
    </div>
  );
}