import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// route.ts
export async function GET() {
    const data = await prisma.documents.findMany({
        select: {
            id: true,
            content: true
        },
        orderBy: { id: "desc" },
        take: 100
    });

    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 400 });

    const csvText = await file.text();
    const records: Record<string, string>[] = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        relax_quotes: true,
    });

    for (const row of records) {
        const content = Object.values(row).join(" ");

        try {
            // 🔹 เรียก Cloudflare AI API เพื่อสร้าง embedding
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

            const result = await response.json();
            // console.log(" Cloudflare AI result:", JSON.stringify(result).slice(0, 300)); // ดู structure จริงๆ

            // ดึงค่าจริงที่เป็น array ของตัวเลขออกมา
            const embedding = result?.result?.data?.[0];
            if (!Array.isArray(embedding)) {
                console.warn(" รูปแบบผลลัพธ์ไม่ถูกต้อง:", result);
                continue;
            }

            // 🔹 แปลงเป็น string สำหรับ SQL
            const embeddingStr = `[${embedding.join(",")}]`;

            //  บันทึกลงฐานข้อมูลด้วย Prisma
            await prisma.$executeRaw`
        INSERT INTO documents (content, embedding)
        VALUES (${content}, ${embeddingStr}::vector)
    `;
        } catch (err) {
            console.error(" Error ในการประมวลผล:", err);
            continue;
        }
    }

    return NextResponse.json({ message: "เพิ่มข้อมูลเรียบร้อยแล้ว " });
}
