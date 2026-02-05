import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import prisma from "@/utils/db";
import bcrypt from "bcrypt";
import { loginSchema } from "@/schemas/login";

/**
 * กำหนดอายุการใช้งานตาม role
 */
const ROLE_EXPIRE = {
    USER: {
        jwt: "3h",
        cookie: 60 * 60 * 3, // 3 ชั่วโมง
    },
    MENTALHEALTH: {
        jwt: "8h",
        cookie: 60 * 60 * 8, // 8 ชั่วโมง
    },
    ADMIN: {
        jwt: "1h",
        cookie: 60 * 60 * 1, // 1 ชั่วโมง
    },
} as const;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        /**
         * Validate input
         */
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        /**
         * Find user
         */
        const user = await prisma.users.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        /**
         * Check password
         */
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        /**
         * เลือกเวลาหมดอายุตาม role
         */
        const roleConfig = ROLE_EXPIRE[user.role];

        if (!roleConfig) {
            return NextResponse.json(
                { message: "Invalid user role" },
                { status: 403 }
            );
        }

        /**
         * Create JWT
         */
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: roleConfig.jwt }
        );

        /**
         * Set Cookie
         */
        const cookie = serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: roleConfig.cookie,
        });

        return NextResponse.json(
            {
                message: "Login successful",
                role: user.role,
            },
            {
                status: 200,
                headers: {
                    "Set-Cookie": cookie,
                },
            }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Login User Error:", error.message);
        } else {
            console.error("Unknown Login Error:", error);
        }

        return NextResponse.json(
            { message: "Server Login Error" },
            { status: 500 }
        );
    }
}
