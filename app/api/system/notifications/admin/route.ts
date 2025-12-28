import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { Notifications } from "@prisma/client"

export async function GET() {
    try {
        const notifications: Notifications[] = await prisma.notifications.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(notifications, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Sever Error admin notifications " }, { status: 500 });
    }
}
