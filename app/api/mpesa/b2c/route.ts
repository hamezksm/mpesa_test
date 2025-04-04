import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
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

    const { phoneNumber, amount, reason } = await request.json();

    // Validate input
    if (!phoneNumber || !amount || !reason) {
      return NextResponse.json(
        { message: "Phone number, amount, and reason are required" },
        { status: 400 }
      );
    }

    // In a real implementation, you would integrate with the MPESA API here
    // For demo purposes, we'll simulate a successful response
    
    // Simulated API integration
    const responseData = {
      ConversationID: "AG_" + Math.random().toString(36).substring(2, 10),
      OriginatorConversationID: "16738-34978-1",
      ResponseCode: "0",
      ResponseDescription: "Accept the service request successfully.",
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("B2C API error:", error);
    return NextResponse.json(
      { message: "An error occurred processing the B2C request" },
      { status: 500 }
    );
  }
}