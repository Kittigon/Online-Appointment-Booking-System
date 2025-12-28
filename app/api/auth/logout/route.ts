import { serialize } from "cookie";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookie = serialize("token", "", {
            httpOnly: true,
            path: "/",
            expires: new Date(0), // Set expiration date to the past to delete the cookie
        });

        return NextResponse.json({ message: "Logout successful" }, {
            status: 200,
            headers: {
                "Set-Cookie": cookie
            }
        });
    } catch (error: unknown) {
        // console.error("Error during logout:", error);
        if (error instanceof Error) {
            console.error("Logout Error: ", error.message);
        } else {
            console.error("Unknown error in logout: ", error);
        }
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });

    }
}