import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { delCache} from "@/utils/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await prisma.notifications.updateMany({
            where: {
                userId: userId,
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        await delCache(`notifications:unread:${userId}`);

        return NextResponse.json({ message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}