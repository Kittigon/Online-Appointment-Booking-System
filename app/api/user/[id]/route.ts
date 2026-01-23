import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import bcrypt from 'bcrypt'
import { changePasswordSchema } from '@/schemas/changePassword';
import { getCache, setCache, delCache } from "@/utils/cache";


// ดึงข้อมูลผู้ใช้ตาม ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const cacheKey = `user:profile:${idNum}`
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

        const showuser = await prisma.users.findUnique({
            where: { id: idNum },
            select: { id: true, email: true, name: true, gender: true, age: true, phone: true, code: true }
        })

        await setCache(cacheKey, { showuser }, 60)

        return NextResponse.json({ showuser }, { status: 200 })
    } catch (error: unknown) {
        console.error("GET ID User Error:", error)
        return NextResponse.json({ message: "Server GET ID User Error!" }, { status: 500 })
    }
}


interface EditUser {
    email: string;
    name: string;
    gender: string;
    age: number;
    phone?: string;
    code?: string;
}

// แก้ไขข้อมูลผู้ใช้
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await req.json() as EditUser
        const { email, name, gender, age, phone, code } = body

        await prisma.users.update({
            where: { id: idNum },
            data: { email, name, gender, age, phone, code }
        })

        await delCache('user:all')
        await delCache(`user:profile:${idNum}`)

        return NextResponse.json({ message: "Update User Success!" }, { status: 200 })
    } catch (error: unknown) {
        console.error("PUT ID User Error:", error)
        return NextResponse.json({ message: "Server PUT ID User Error!" }, { status: 500 })
    }
}

// เปลี่ยนรหัสผ่านผู้ใช้

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const userId = Number(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { message: "Invalid user ID" },
                { status: 400 }
            );
        }

        // 1️ รับ body
        const body = await req.json();

        // 2️ validate ด้วย Zod (สำคัญ!)
        const parsed = changePasswordSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { message: "ข้อมูลไม่ถูกต้อง" },
                { status: 400 }
            );
        }

        const { currentPassword, newPassword } = parsed.data;

        // 3️ ดึง user จาก DB
        const user = await prisma.users.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json(
                { message: "ไม่พบผู้ใช้" },
                { status: 404 }
            );
        }

        // 4️ ตรวจรหัสผ่านเดิม
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return NextResponse.json(
                { message: "รหัสผ่านเดิมไม่ถูกต้อง" },
                { status: 401 }
            );
        }

        // 5️ hash รหัสใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 6️ update
        await prisma.users.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await delCache('user:all')
        await delCache(`user:profile:${userId}`)

        return NextResponse.json(
            { message: "เปลี่ยนรหัสผ่านสำเร็จ" },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("PATCH ID User Error:", error)
        return NextResponse.json({ message: "Server PATCH ID User Error!" }, { status: 500 })
    }
}


// DELETE - ลบผู้ใช้
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.users.delete({ where: { id: idNum } })

        await delCache('user:all')
        await delCache(`user:profile:${idNum}`)
        
        return NextResponse.json({ message: "Delete User Success!" }, { status: 200 })
    } catch (error: unknown) {
        console.error("DELETE ID User Error:", error)
        return NextResponse.json({ message: "Server DELETE ID User Error!" }, { status: 500 })
    }
}
