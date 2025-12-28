import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from 'jsonwebtoken';
import prisma from "@/utils/db";
import bcrypt from 'bcrypt';
import { loginSchema } from "@/schemas/login";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = body;

        const parsed = loginSchema.safeParse({ email, password });

        if (!parsed.success) {
            return NextResponse.json(
                { message: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }

        //create token
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }, process.env.JWT_SECRET as string, { expiresIn: "1h" });


        // Set cookie
        const cookie = serialize("token", token, {
            httpOnly: true, // javascript ไม่่สามารถเข้าถึง cookie นี้ได้
            path: "/", // cookie นี้ใช้ได้กับทุก path
            secure: process.env.NODE_ENV === "production", // ใช้ secure cookie ใน production เท่านั้น
            sameSite: "strict", // ป้องกัน CSRF
            maxAge:  60 * 60 * 3, // 3 hour
        })

        return NextResponse.json({ message: "Login successful" }, {
            status: 200,
            headers: {
                "Set-Cookie": cookie
            }
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Login User Error : ", error.message);
        } else {
            console.error("Unknown error in Login /users : ", error);
        }
        return NextResponse.json({ message: "Server Login user Error!" }, { status: 400 });

    }
}

