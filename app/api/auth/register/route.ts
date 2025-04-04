import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { username, password, email, name, phone } = await request.json();

        // Validate input
        if (!username || !password || !email) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email }],
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Username or email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email,
                name,
                phone,
            },
        });

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

        // Return success without exposing password
        const userWithoutPassword = { ...user };
        delete (userWithoutPassword as { password?: string }).password;

        return NextResponse.json(
            {
                message: "User registered successfully",
                user: userWithoutPassword,
                token // Include token in the response
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred during registration" },
            { status: 500 }
        );
    }
}
