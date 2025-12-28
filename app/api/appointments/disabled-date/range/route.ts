import prisma from "@/utils/db";

export async function POST(req: Request) {
    const { startDate, endDate } = await req.json();

    // แปลงเป็นวันที่แต่ละวัน
    const dates: string[] = [];
    const current = new Date(startDate);
    const last = new Date(endDate);

    while (current <= last) {
        dates.push(current.toISOString().split("T")[0]); // yyyy-mm-dd
        current.setDate(current.getDate() + 1);
    }

    // บันทึกทีละวัน (skip ถ้าซ้ำ)
    if (dates.length > 0) {
        await prisma.disabledDate.createMany({
            data: dates.map(d => ({ date: d })),
            skipDuplicates: true,
        });
    }

    return Response.json({ message: "ปิดหลายวันสำเร็จ", dates });
}

export async function DELETE(req: Request) {
    const { startDate, endDate } = await req.json();

    await prisma.disabledDate.deleteMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    return Response.json({ message: "เปิดวันทั้งหมดสำเร็จ" });
}