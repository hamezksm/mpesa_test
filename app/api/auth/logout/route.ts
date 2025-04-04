import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = cookies();
  
  // Clear the authentication cookie
  (await cookieStore).delete('auth_token');
  
  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}