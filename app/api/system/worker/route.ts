import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
//ทำงานทีละ 5 records ต่อรอบ
const BATCH_SIZE = 5;

export async function POST(req: NextRequest) {
    try {
        const { jobId, records } = await req.json();

        //  ตรวจสอบ payload เบื้องต้น
        if (!jobId || !records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: "Invalid payload" },
                { status: 400 }
            );
        }

        //  ตรวจสอบสถานะงานก่อน (กันรันซ้ำ)
        const job = await prisma.documentJob.findUnique({
            where: { id: jobId },
        });

        // ถ้าไม่มีงานนี้ หรือไม่ใช่สถานะ PENDING ให้หยุด
        if (!job || job.status !== "PENDING") {
            return NextResponse.json({ status: "ignored" });
        }

        //  ล็อกงานเป็น PROCESSING
        await prisma.documentJob.update({
            where: { id: jobId },
            data: { status: "PROCESSING" },
        });

        //  ทำงานทีละ batch 
        // แบ่งข้อมูลเป็นชุดละ 5 records 
        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);

            // ทำพร้อมกัน 5 record
            await Promise.all(
                batch.map(async (row: Record<string, string>) => {
                    // รวมค่าทุก column เป็น string เดียว (ปรับตามความเหมาะสม)
                    const content = Object.values(row).join(" ");

                    // เรียก embedding API
                    const response = await fetch(
                        `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/baai/bge-m3`,
                        {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ text: content }),
                        }
                    );

                    if (!response.ok) {
                        throw new Error("Embedding API failed");
                    }

                    const result = await response.json();
                    const embedding = result?.result?.data?.[0];

                    if (!Array.isArray(embedding)) return;

                    //แปลง embedding เป็น pgvector format [0.123, 0.456, 0.789]
                    const embeddingStr = `[${embedding.join(",")}]`;

                    //  กัน insert ซ้ำ
                    await prisma.$executeRaw`
                        INSERT INTO documents (content, embedding)
                        VALUES (${content}, ${embeddingStr}::vector)
                    `;
                })
            );
        }

        //  งานเสร็จ
        await prisma.documentJob.update({
            where: { id: jobId },
            data: { status: "DONE" },
        });

        return NextResponse.json({ status: "done" });

    } catch (err) {
        console.error("Worker error:", err);

        // ถ้าเกิด error ให้ mark เป็น ERROR
        try {
            const { jobId } = await req.json();
            if (jobId) {
                await prisma.documentJob.update({
                    where: { id: jobId },
                    data: { status: "ERROR" },
                });
            }
        } catch {}

        return NextResponse.json(
            { status: "error" },
            { status: 500 }
        );
    }
}
