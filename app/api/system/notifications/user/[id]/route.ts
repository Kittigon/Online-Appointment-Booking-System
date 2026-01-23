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

        const cacheKey = `notifications:user:${userId}`; 
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const notifications = await prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        await setCache(cacheKey, {notifications} , 30);

        return NextResponse.json({notifications});
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
