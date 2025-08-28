/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

// =========================
// RouteContext Type
// =========================
type SegmentParams<T extends Object = any> = T extends Record<string, any>
    ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
    : T

type RouteContext = { params: SegmentParams }

// =========================
// PUT - แก้ไขการนัดหมาย
// สำหรับ mentalhealth | admin
// =========================
export async function PUT(
    req: Request,
    context: RouteContext
) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await req.json()
        const { date, time, description } = body

        await prisma.appointments.update({
            where: { id },
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

// =========================
// DELETE - ลบการนัดหมาย
// สำหรับ mentalhealth | admin
// =========================
export async function DELETE(
    req: NextRequest,
    context: RouteContext
) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.appointments.delete({
            where: { id }
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
