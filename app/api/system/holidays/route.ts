import { NextResponse, NextRequest } from "next/server";
import prisma from "@/utils/db";
import { getCache , setCache ,delCache } from "@/utils/cache"; 

export async function GET() {
    try {
        const cacheKey = "holidays:all";
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const holidays = await prisma.holiday.findMany({
            orderBy: { date: "asc" }
        })

        await setCache(cacheKey, holidays, 3600); // Cache for 1 hour

        return NextResponse.json(holidays)
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, name, type } = body;
        

        if (!date || !name || !type) {
            return NextResponse.json({ message: "ข้อมูลไม่ครบ" }, { status: 400 })
        }

        const holiday = await prisma.holiday.create({
            data: { date, name, type }
        })

        await delCache("holidays:all"); // Invalidate cache

        return NextResponse.json(holiday, { status: 201 })
    }catch (error) {
        console.error("Error creating holiday:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}