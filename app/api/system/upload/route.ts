import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// route.ts
export async function GET(req: NextRequest) {
    try {
        // const cacheKey = "documents:all";
        // const cached = await getCache(cacheKey);
        // if (cached) {
        //     return NextResponse.json(cached);
        // }

        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            prisma.documents.findMany({
                select: {
                    id: true,
                    content: true,
                },
                orderBy: { id: "desc" },
                skip,
                take: limit,
            }),
            prisma.documents.count(),
        ]);


        const result = ({
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

        // await setCache(cacheKey, result, 60);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("GET documents error:", error);
        return NextResponse.json(
            { error: "Failed to load documents" },
            { status: 500 }
        );
    }
}
export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 400 });
    }

    const csvText = await file.text();
    const records: Record<string, string>[] = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
    });

    if (records.length === 0) {
        return NextResponse.json({ message: "ไฟล์ว่าง" }, { status: 400 });
    }

    //  สร้าง job
    const job = await prisma.documentJob.create({
        data: {},
    });

    const workerUrl = `${process.env.APP_URL}/api/system/worker`;
    //  ส่ง jobId + records เข้า queue
    await fetch(
        `https://qstash.upstash.io/v2/publish/${workerUrl}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.QSTASH_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jobId: job.id,
                records,
            }),
        }
    );

    return NextResponse.json({
        message: "อัปโหลดสำเร็จ กำลังประมวลผลข้อมูล",
        jobId: job.id,
        total: records.length,
    });
}