import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = await cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        return NextResponse.json({ user: decoded }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Get User Token Error:", error.message);
        } else {
            console.error("Unknown error in Get User Token:", error);
        }
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}