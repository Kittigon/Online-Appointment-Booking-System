import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { reportproblems } from "@prisma/client";
import { getCache , setCache , delCache} from "@/utils/cache";


//ปัญหาจากผู้ใช้งานทั้งหมด
export async function GET() {
    try {
        const cacheKey = 'reports:all';
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const problems = await prisma.reportproblems.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        await setCache(cacheKey, problems, 120);

        return NextResponse.json(problems);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error instanceof Error) {
                console.error("Report a Problem Error : ", error.message)
            } else {
                console.error("Unknown error in Report a Problem : ", error)
            }
            return NextResponse.json({ message: "Sever Report a Problem Error !" }, { status: 400 })
        }
    }
}

// รายงานปัญหาจากผู้ใช้งาน
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, type, description } = body as reportproblems;
    try {
        const reportproblems = await prisma.reportproblems.create({
            data: {
                userId,
                type,
                description
            }
        })

        await prisma.notifications.create({
            data: {
                userId,
                type: "REPORT_NEW",
                title: "รับรายงานปัญหาแล้ว",
                message: `เราได้รับรายงานปัญหาของคุณแล้ว ทีมงานกำลังตรวจสอบ`,
                reportId: reportproblems.id
            }
        })

        await delCache('reports:all')

        return NextResponse.json({ message: "Report a Problem Success !" }, { status: 201 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Report a Problem Error : ", error.message)
        } else {
            console.error("Unknown error in Report a Problem : ", error)
        }
        return NextResponse.json({ message: "Sever Report a Problem Error !" }, { status: 400 })
    }
}