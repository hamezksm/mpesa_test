import { NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
    "/",
    "/signup",
    "/api/auth",
    "/api/auth/signup",
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the path is public
    if (
        publicPaths.some(
            (path) => pathname === path || pathname.startsWith("/api/auth/")
        )
    ) {
        return NextResponse.next();
    }

    // Get the token from the cookies
    const token = request.cookies.get("auth_token")?.value;

    // If no token, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        // Clear the invalid cookie and redirect to login
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("auth_token");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
};
