import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // Validate input
        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required" },
                { status: 400 }
            );
        }

        // Find the user by username
        const user = await prisma.user.findFirst({
            where: { username },
        });

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Verify password
        const passwordMatch = await compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json(
                { message: "Invalid credentials" },
                { status: 401 }
            );
        }

        // Generate token - await if it returns a Promise
        const token = await signToken({
            userId: user.id,
            username: user.username,
            email: user.email
        });

        // Set HTTP-only cookie - cookies() returns the store directly, no need to await
        const cookieStore = cookies();
        (await cookieStore).set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
            sameSite: 'strict'
        });

        const userWithoutPassword = { ...user };
        delete (userWithoutPassword as { password?: string }).password;

        // Return success response with user data and token
        return NextResponse.json(
            {
                message: "Login successful",
                user: userWithoutPassword,
                token // Include token in the response for client-side storage if needed
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "An error occurred during login" },
            { status: 500 }
        );
    }
}
