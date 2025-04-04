"use client";

import { useState } from "react";
import Image from "next/image";
import LoginForm from "./components/auth/login-form";
import RegisterForm from "./components/auth/register-form";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-green-50 flex-col justify-center items-center p-4">
        <Image
          src="/mpesa.svg"
          alt="MPESA Logo"
          width={240}
          height={120}
          priority
          className="mb-4"
        />
        <h1 className="text-2xl font-bold text-green-600 mb-2">MPESA Payment Solution</h1>
        <p className="text-gray-600 text-center max-w-md text-sm">
          Experience fast, secure, and convenient mobile money transfers with MPESA.
          Login or register to get started with financial freedom.
        </p>
      </div>

      {/* Right Section - Authentication Forms */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-3">
        {/* Mobile Logo (only visible on small screens) */}
        <div className="md:hidden mb-3">
          <Image
            src="/mpesa.svg"
            alt="MPESA Logo"
            width={160}
            height={80}
            priority
          />
        </div>

        <div className="w-full max-w-md bg-white rounded-lg shadow-md flex flex-col h-[80vh]">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white z-10 border-b">
            <div className="flex">
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === "login" 
                    ? "text-green-600 border-b-2 border-green-600 font-medium" 
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 text-center ${
                  activeTab === "register" 
                    ? "text-green-600 border-b-2 border-green-600 font-medium" 
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>
            
            <h2 className="text-xl font-bold my-3 text-center text-green-500">
              {activeTab === "login" ? "Login to MPESA" : "Register for MPESA"}
            </h2>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </div>
    </div>
  );
}