import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getCache, setCache } from "@/utils/cache";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const cacheKey = `notifications:unread:${userId}`;
        const cachedCount = await getCache(cacheKey);
        if (cachedCount) {
            return NextResponse.json({ unreadCount: cachedCount });
        }

        const unreadCount = await prisma.notifications.count({
            where: {
                userId: userId,
                isRead: false,
            },
        });

        await setCache(cacheKey, { unreadCount }, 20);

        return NextResponse.json({ unreadCount });
    } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}