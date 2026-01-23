import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { Notifications } from "@prisma/client"
import { getCache, setCache } from "@/utils/cache";


export async function GET() {
    try {
        const cacheKey = 'notifications:dass-21:all'
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const DASS21noti: Notifications[] = await prisma.notifications.findMany({
            where: {
                type: { in: ["DASS_RESULT"] }
            },
            orderBy: { createdAt: "desc" }
        });

        await setCache(cacheKey, { DASS21noti }, 30);
        
        return NextResponse.json({ DASS21noti });
    } catch {
        return NextResponse.json({ error: "Sever Error Dass21 Notifications" }, { status: 500 });
    }
}

