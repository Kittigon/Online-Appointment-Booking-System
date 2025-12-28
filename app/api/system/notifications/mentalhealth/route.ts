import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { Notifications } from "@prisma/client"


export async function GET() {
    try {
        const DASS21noti: Notifications[] = await prisma.notifications.findMany({
            where: {
                type: { in: ["DASS_RESULT"] }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ DASS21noti });
    } catch {
        return NextResponse.json({ error: "Sever Error Dass21 Notifications" }, { status: 500 });
    }
}

