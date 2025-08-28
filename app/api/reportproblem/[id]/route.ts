/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { reportproblems } from "@prisma/client";

// =========================
// RouteContext Type
// =========================
type SegmentParams<T extends Object = any> = T extends Record<string, any>
    ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
    : T

type RouteContext = { params: SegmentParams }

// =========================
// PUT - แก้ไขฟอร์มปัญหาจากผู้ใช้งาน
// =========================
export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = (await req.json()) as reportproblems
        const { type, description } = body

        await prisma.reportproblems.update({
            where: { id },
            data: { type, description },
        })

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
export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const { status } = await req.json()

        await prisma.reportproblems.update({
            where: { id },
            data: { status },
        })

        return NextResponse.json(
            { message: "Report a Problem status updated successfully" },
            { status: 200 }
        )
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("PATCH Report a Problem Error:", error.message)
        } else {
            console.error("Unknown PATCH Report a Problem Error:", error)
        }
        return NextResponse.json(
            { message: "Server PATCH Report a Problem Error!" },
            { status: 500 }
        )
    }
}

// =========================
// DELETE - ลบฟอร์มปัญหาจากผู้ใช้งาน
// =========================
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.reportproblems.delete({
            where: { id },
        })

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
