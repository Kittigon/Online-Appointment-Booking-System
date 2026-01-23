// /api/admin/user/[id]/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import bcrypt from 'bcrypt'
import { delCache } from "@/utils/cache";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const id = await context.params;
        const userId = Number(id.id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "Invalid user ID" },
                { status: 400 }
            );
        }

        const { newPassword } = await req.json();

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: userId },
            data: { password: hashed },
        });

        await delCache(`user:profile:${userId}`)

        return NextResponse.json({ message: 'Reset password success' });
    } catch (error) {
        console.error("Admin Reset Password User Error:", error)
        return NextResponse.json({ message: "Server Admin Reset Password User Error!" }, { status: 500 })
    }
}
