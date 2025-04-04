"use client";

import { useState } from "react";
import Button from "@/app/components/ui/button";
import Input from "@/app/components/ui/input";

export default function STKPushPage() {
    const [formData, setFormData] = useState({
        phoneNumber: "",
        amount: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [checkoutId, setCheckoutId] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/mpesa/stkpush", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "STK push request failed");
            }

            setSuccess(
                "Payment request sent successfully! Ask the customer to check their phone."
            );
            setCheckoutId(data.checkoutRequestID);
            setFormData({ ...formData, phoneNumber: "", amount: "" });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                STK Push Request
            </h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <p className="text-gray-600 mb-4">
                    Request payments from customers by sending a payment prompt
                    to their phones.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
                        {success}
                        {checkoutId && (
                            <div className="mt-2 text-sm">
                                Checkout ID: {checkoutId}
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-black">
                    <Input
                        label="Customer Phone Number"
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

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? "Processing..." : "Send Payment Request"}
                    </Button>
                </form>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                <h3 className="font-medium mb-2">About STK Push</h3>
                <p>
                    Lipa Na M-Pesa Online (STK Push) enables customers to make
                    payments through MPESA by sending a payment prompt to their
                    phones. The customer can then authorize the payment by
                    entering their M-PESA PIN.
                </p>
            </div>
        </div>
    );
}
