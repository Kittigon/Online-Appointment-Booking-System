import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

export async function PATCH(
    req: NextRequest,
    context : { params: Promise<{ id: string }>}
) {
    const id = await context.params;
    const idNum = Number(id.id);
    if (isNaN(idNum)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const { content } = await req.json();
    if (!content || typeof content !== "string") {
        return NextResponse.json({ message: "content ไม่ถูกต้อง" }, { status: 400 });
    }

    try {
        // 1) เรียก Cloudflare AI เพื่อสร้าง embedding ใหม่
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

        if (!Array.isArray(embedding)) {
            return NextResponse.json(
                { message: "Embedding ไม่ถูกต้อง" },
                { status: 500 }
            );
        }

        const embeddingStr = `[${embedding.join(",")}]`;

        // 2) UPDATE content + embedding (ใช้ raw SQL เฉพาะ vector)
        await prisma.$executeRaw`
        UPDATE documents
        SET content = ${content},
            embedding = ${embeddingStr}::vector
        WHERE id = ${idNum}
        `;

        // await delCache("documents:all");

        return NextResponse.json({ message: "แก้ไขข้อมูลเรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Update error:", err);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการแก้ไข" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    context : { params: Promise<{ id: string }>}
) {
    const id = await context.params;
    const idNum = Number(id.id); 
    if (isNaN(idNum)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    try {
        await prisma.documents.delete({
            where: { id : idNum },
        });
        
        // await delCache("documents:all");

        return NextResponse.json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
    } catch (err) {
        console.error("Delete error:", err);
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดในการลบ" },
            { status: 500 }
        );
    }
}
