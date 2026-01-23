import prisma from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { delCache } from "@/utils/cache";

// PATCH: อัปเดต role หรือ password
export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const userId = Number(id.id);
        // console.log("Updating Role for User ID:", userId);

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { role } = body;

        // ไม่มีข้อมูลอะไรให้แก้ไข
        if (!role) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                role: role
            }
        });

        await delCache('user:all')
        await delCache(`user:profile:${userId}`)

        return NextResponse.json({ message: "Updated Role successfully", updatedUser }, { status: 200 });

    } catch (error: unknown) {
        console.error("PATCH Update Role User Error:", error);
        return NextResponse.json({ message: "Server PATCH Update Role User Error!" }, { status: 500 });
    }
}