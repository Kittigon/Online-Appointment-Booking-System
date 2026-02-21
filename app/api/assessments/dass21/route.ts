import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getCache, setCache, delCache } from "@/utils/cache";

export async function GET() {
    try {
        const cacheKey = "dass21:all";
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // 1️⃣ นับจำนวนครั้งต่อ user
        const grouped = await prisma.dass_21_result.groupBy({
            by: ["user_id"],
            _count: {
                id: true,
            },
            _max: {
                created_at: true,
            },
        });

        // 2️⃣ ดึงข้อมูล user ทั้งหมดที่อยู่ใน grouped
        const userIds = grouped.map(g => g.user_id).filter(Boolean);

        const users = await prisma.user_consent.findMany({
            where: {
                line_user_id: {
                    in: userIds as string[],
                },
            },
            select: {
                line_user_id: true,
                name: true,
                phone: true,
                student_id: true,
            },
        });

        // 3️⃣ รวมข้อมูลเข้าด้วยกัน
        const result = grouped.map(g => {
            const user = users.find(u => u.line_user_id === g.user_id);

            return {
                user_id: g.user_id,
                name: user?.name ?? null,
                phone: user?.phone ?? null,
                student_id: user?.student_id ?? null,
                total: g._count.id,
                lastDate: g._max.created_at,
            };
        });

        await setCache(cacheKey, { result }, 120);

        return NextResponse.json({ result });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET DASS21 Error : ", error.message);
        } else {
            console.error("Unknown error in GET DASS21!", error);
        }
        return NextResponse.json(
            { message: "Server GET DASS21 Error!" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;
        await prisma.dass_21_result.create({
            data: {
                user_id
            }
        })

        await delCache('dass21:all')

        return NextResponse.json({ message: "Create DASS21 Success!" })

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET DASS21 Error : ", error.message)
        } else {
            console.error("Unknow error in GET DASS21 ! ", error)
        }
        return NextResponse.json({ message: "Sever GET DASS21 Error !" }, { status: 400 })
    }
}