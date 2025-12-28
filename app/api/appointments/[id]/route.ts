import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

// =========================
// PUT - แก้ไขการนัดหมาย
// สำหรับ mentalhealth | admin
// =========================
export async function PUT(
    req: NextRequest,
    context: {params : Promise<{id: string}>}
) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)

        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await req.json()
        const { date, time, description } = body

        await prisma.appointments.update({
            where: { id: idNum },
            data: { date, time, description },
        })

        return NextResponse.json(
            { message: "Update Appointment Success!" },
            { status: 200 }
        )
    } catch (error) {
        console.error("PUT ID Appointment Error:", error)
        return NextResponse.json(
            { message: "Server PUT ID Appointment Error!" },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const id = await context.params;
        const idNum = Number(id.id);
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { status, reason } = body;

        if (!["CONFIRMED", "CANCELLED"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // อัปเดตนัดหมาย
        const updated = await prisma.appointments.update({
            where: { id: idNum },
            data: {
                status,
                cancelReason:
                    status === "CANCELLED" ? reason : null  // กรณียกเลิกเท่านั้นที่มีเหตุผล
            }
        });

        // =====================================
        //  เพิ่ม Notification (สำคัญมาก)
        // =====================================
        if (status === "CONFIRMED") {
            await prisma.notifications.create({
                data: {
                    userId: updated.userId,
                    type: "APPOINTMENT_CONFIRMED",
                    title: "การนัดหมายได้รับการยืนยันแล้ว",
                    message: `นัดหมายของคุณวันที่ ${updated.date} เวลา ${updated.time} ได้รับการยืนยันแล้ว`,
                    appointmentId: updated.id,
                }
            });
        }

        if (status === "CANCELLED") {
            await prisma.notifications.create({
                data: {
                    userId: updated.userId,
                    type: "APPOINTMENT_CANCELLED",
                    title: "การนัดหมายถูกยกเลิก",
                    message: `นัดหมายวันที่ ${updated.date} เวลา ${updated.time} ถูกยกเลิก เนื่องจาก: ${reason}`,
                    appointmentId: updated.id,
                }
            });
        }

        return NextResponse.json({ message: "Updated successfully", updated });

    } catch (error) {
        console.error("PATCH appointment error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// =========================
// DELETE - ลบการนัดหมาย
// สำหรับ mentalhealth | admin
// =========================
export async function DELETE(
    req: NextRequest,
    context: {params : Promise<{id: string}>}
) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.appointments.delete({
            where: { id: idNum },   
        })

        return NextResponse.json({ message: "DELETE Appointment Success!" }, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("DELETE ID Appointment Error:", error.message)
        } else {
            console.error("Unknown error in DELETE ID Appointment!", error)
        }
        return NextResponse.json(
            { message: "Server DELETE ID Appointment Error!" },
            { status: 500 }
        )
    }
}
