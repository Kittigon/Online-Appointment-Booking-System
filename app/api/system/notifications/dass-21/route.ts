import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function POST(req: NextRequest) {
    try {
        const { line_user_id, type, title, message } = await req.json();

        const create = await prisma.notifications.create({
            data: {
                line_user_id,
                type,
                title,
                message
            }
        });

        return NextResponse.json({ create });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Create notification failed" }, { status: 400 });
    }
}