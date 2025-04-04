import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Verify authentication
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { message: "Invalid authentication token" },
        { status: 401 }
      );
    }

    // In a real implementation, you would integrate with the MPESA API here
    // For demo purposes, we'll simulate a balance response
    
    // Generate a random balance between 10,000 and 100,000
    const balance = (Math.floor(Math.random() * 90000) + 10000).toFixed(2);

    return NextResponse.json({ balance }, { status: 200 });
  } catch (error) {
    console.error("Balance API error:", error);
    return NextResponse.json(
      { message: "An error occurred fetching the balance" },
      { status: 500 }
    );
  }
}