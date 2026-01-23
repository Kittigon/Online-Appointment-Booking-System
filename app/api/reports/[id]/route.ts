import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { reportproblems } from "@prisma/client";
import { delCache } from "@/utils/cache";


// =========================
// PUT - แก้ไขฟอร์มปัญหาจากผู้ใช้งาน
// =========================
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = (await req.json()) as reportproblems
        const { type, description } = body

        await prisma.reportproblems.update({
            where: { id: idNum },
            data: { type, description },
        })

        await delCache('reports:all')

        return NextResponse.json(
            { message: "Update Report a Problem Success!" },
            { status: 200 }
        )
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Update Report a Problem Error:", error.message)
        } else {
            console.error("Unknown error in Update Report a Problem:", error)
        }
        return NextResponse.json(
            { message: "Server Update Report a Problem Error!" },
            { status: 500 }
        )
    }
}

// =========================
// PATCH - อัพเดต status
// =========================
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
        const { status } = body;

        // ตรวจสอบค่าสถานะที่ถูกต้องตาม ENUM
        const allowed = ["NEW", "IN_PROGRESS", "RESOLVED", "CANCELLED"];
        if (!allowed.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // อัปเดตรายงานปัญหา
        const updated = await prisma.reportproblems.update({
            where: { id: idNum },
            data: {
                status
            }
        });

        // notification
        if (status === "NEW") {
            await prisma.notifications.create({
                data: {
                    userId: updated.userId,
                    type: "REPORT_NEW",
                    title: "รับรายงานปัญหาแล้ว",
                    message: `เราได้รับรายงานปัญหาของคุณแล้ว ทีมงานจะดำเนินการตรวจสอบเร็วที่สุด`,
                    reportId: updated.id
                }
            });
        }

        if (status === "IN_PROGRESS") {
            await prisma.notifications.create({
                data: {
                    userId: updated.userId,
                    type: "REPORT_IN_PROGRESS",
                    title: "กำลังตรวจสอบรายงานปัญหา",
                    message: `ทีมงานกำลังดำเนินการตรวจสอบปัญหาที่คุณแจ้งเข้ามา`,
                    reportId: updated.id
                }
            });
        }

        if (status === "RESOLVED") {
            await prisma.notifications.create({
                data: {
                    userId: updated.userId,
                    type: "REPORT_RESOLVED",
                    title: "ปัญหาได้รับการแก้ไขแล้ว",
                    message: `ปัญหาที่คุณแจ้งเข้ามาได้รับการแก้ไขเรียบร้อยแล้ว`,
                    reportId: updated.id
                }
            });
        }

        // if (status === "CANCELLED") {
        //     await prisma.notifications.create({
        //         data: {
        //             userId: updated.userId,
        //             type: "REPORT_CANCELLED",
        //             title: "รายงานถูกยกเลิก",
        //             message: `รายงานปัญหาถูกยกเลิก เนื่องจาก: ${reason || "ไม่ระบุเหตุผล"}`,
        //             reportId: updated.id
        //         }
        //     });
        // }

        await delCache('reports:all')

        return NextResponse.json({ message: "Updated successfully", updated });

    } catch (error) {
        console.error("PATCH report problem error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}


// =========================
// DELETE - ลบฟอร์มปัญหาจากผู้ใช้งาน
// =========================
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const id = await context.params;
        const idNum = Number(id.id)
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.reportproblems.delete({
            where: { id: idNum },
        })

        await delCache('reports:all')

        return NextResponse.json(
            { message: "Delete Report a Problem Success!" },
            { status: 200 }
        )
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Delete Report a Problem Error:", error.message)
        } else {
            console.error("Unknown Delete Report a Problem Error:", error)
        }
        return NextResponse.json(
            { message: "Server Delete Report a Problem Error!" },
            { status: 500 }
        )
    }
}
