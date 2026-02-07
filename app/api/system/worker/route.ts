import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BATCH_SIZE = 5;

export async function POST(req: NextRequest) {
    const { jobId, records } = await req.json();

    try {
        await prisma.documentJob.update({
            where: { id: jobId },
            data: { status: "PROCESSING" },
        });

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
            const batch = records.slice(i, i + BATCH_SIZE);

            await Promise.all(
                batch.map(async (row: Record<string, string>) => {
                    const content = Object.values(row).join(" ");

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
                    const embedding = result?.result?.data?.[0];
                    if (!Array.isArray(embedding)) return;

                    const embeddingStr = `[${embedding.join(",")}]`;

                    await prisma.$executeRaw`
            INSERT INTO documents (content, embedding)
            VALUES (${content}, ${embeddingStr}::vector)
        `;
                })
            );
        }

        await prisma.documentJob.update({
            where: { id: jobId },
            data: { status: "DONE" },
        });

        return NextResponse.json({ status: "done" });
    } catch (err) {
        console.error("Worker error:", err);

        await prisma.documentJob.update({
            where: { id: jobId },
            data: { status: "ERROR" },
        });

        return NextResponse.json({ status: "error" }, { status: 500 });
    }
}
