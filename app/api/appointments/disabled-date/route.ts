import prisma from "@/utils/db";
import { NextResponse } from "next/server";
import { getCache, setCache, delCache } from "@/utils/cache";


// ดึงวันปิดให้บริการ
export async function GET() {
    try {
        const cacheKey = 'disabled-date:all'
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

        const disabled = await prisma.disabledDate.findMany();
        await setCache(cacheKey, { disabled }, 60 * 10)

        return NextResponse.json({ disabled });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// เพิ่มวันปิดให้บริการ
export async function POST(req: Request) {
    try {
        const { date } = await req.json();

        const exists = await prisma.disabledDate.findFirst({ where: { date } });

        if (!exists) {
            await prisma.disabledDate.create({ data: { date } });
        }

        await delCache('disabled-date:all')

        return NextResponse.json({ message: "ปิดวันนี้สำเร็จ" });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// ลบวันปิดให้บริการ
export async function DELETE(req: Request) {
    try {
        const { date } = await req.json();
        await prisma.disabledDate.deleteMany({ where: { date } });
        await delCache('disabled-date:all')

        return NextResponse.json({ message: "เปิดวันนี้สำเร็จ" });
    } catch {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}