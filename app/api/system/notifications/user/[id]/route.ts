import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params; 
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const notifications = await prisma.notifications.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({notifications});
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
