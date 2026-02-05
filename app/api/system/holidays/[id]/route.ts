import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { delCache } from "@/utils/cache";

// แก้ไข holiday
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {

        const id = await context.params;
        const idNum = Number(id.id)

        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const { name, type, date } = await req.json();

        const holiday = await prisma.holiday.update({
            where: { id: idNum },
            data: { name, type, date },
        });

        await delCache("holidays:all"); // Invalidate cache

        return NextResponse.json(holiday);
    } catch (error) {
        console.error("Error updating holiday:", error);
        return NextResponse.json(
            { message: "Update failed" },
            { status: 500 }
        );
    }
}

//  ลบ holiday (ของเดิมถูกแล้ว)
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }
        await prisma.holiday.delete({
            where: { id: idNum },
        });

        await delCache("holidays:all"); // Invalidate cache

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting holiday:", error);
        return NextResponse.json(
            { message: "Delete failed" },
            { status: 500 }
        );
    }
}
