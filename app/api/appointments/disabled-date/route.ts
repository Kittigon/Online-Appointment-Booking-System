import prisma from "@/utils/db";

// ดึงวันปิดให้บริการ
export async function GET() {
    const disabled = await prisma.disabledDate.findMany();
    return Response.json({ disabled });
}

// เพิ่มวันปิดให้บริการ
export async function POST(req: Request) {
    const { date } = await req.json();

    const exists = await prisma.disabledDate.findFirst({ where: { date } });

    if (!exists) {
        await prisma.disabledDate.create({ data: { date } });
    }

    return Response.json({ message: "ปิดวันนี้สำเร็จ" });
}

// ลบวันปิดให้บริการ
export async function DELETE(req: Request) {
    const { date } = await req.json();

    await prisma.disabledDate.deleteMany({ where: { date } });

    return Response.json({ message: "เปิดวันนี้สำเร็จ" });
}