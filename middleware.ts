import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type Role = "ADMIN" | "USER" | "MENTALHEALTH";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const { payload } = await jwtVerify(token, secret);
        const role = payload.role as Role | undefined;

        if (pathname === "/") {
            if (role === "ADMIN") {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            }
            if (role === "USER") {
                return NextResponse.redirect(new URL("/user/appointment", req.url));
            }
            if (role === "MENTALHEALTH") {
                return NextResponse.redirect(
                    new URL("/mentalhealth/appointment", req.url)
                );
            }
            return NextResponse.redirect(new URL("/login", req.url));
        }

        if (pathname.startsWith("/admin") && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (pathname.startsWith("/user") && role !== "USER") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        if (pathname.startsWith("/mentalhealth") && role !== "MENTALHEALTH") {
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: [
        "/",
        "/user/:path*",
        "/admin/:path*",
        "/mentalhealth/:path*",
        "/profile",
        "/changepassword",
    ],
};
