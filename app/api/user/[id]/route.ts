/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import bcrypt from 'bcrypt'

// =========================
// RouteContext Type
// =========================
type SegmentParams<T extends Object = any> = T extends Record<string, any>
    ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
    : T

type RouteContext = { params: SegmentParams }

// =========================
// GET - ดึงข้อมูลผู้ใช้ตาม id
// =========================
export async function GET(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const showuser = await prisma.users.findUnique({
            where: { id },
            select: { email: true, name: true, gender: true, age: true }
        })

        return NextResponse.json({ showuser }, { status: 200 })
    } catch (error: unknown) {
        console.error("GET ID User Error:", error)
        return NextResponse.json({ message: "Server GET ID User Error!" }, { status: 500 })
    }
}

// =========================
// PUT - แก้ไขข้อมูลผู้ใช้
// =========================
interface EditUser {
    email: string;
    name: string;
    gender: string;
    age: number;
}

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const body = await req.json() as EditUser
        const { email, name, gender, age } = body

        await prisma.users.update({
            where: { id },
            data: { email, name, gender, age }
        })

        return NextResponse.json({ message: "Update User Success!" }, { status: 200 })
    } catch (error: unknown) {
        console.error("PUT ID User Error:", error)
        return NextResponse.json({ message: "Server PUT ID User Error!" }, { status: 500 })
    }
}

// =========================
// PATCH - เปลี่ยนรหัสผ่านผู้ใช้
// =========================
interface ChangePassword {
    password: string;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        const { password } = await req.json() as ChangePassword
        const hashPassword = await bcrypt.hash(password, 10)

        await prisma.users.update({
            where: { id },
            data: { password: hashPassword }
        })

        return NextResponse.json({ message: "Update Password Success!" }, { status: 200 })
    } catch (error: unknown) {
        console.error("PATCH ID User Error:", error)
        return NextResponse.json({ message: "Server PATCH ID User Error!" }, { status: 500 })
    }
}

// =========================
// DELETE - ลบผู้ใช้
// =========================
export async function DELETE(req: NextRequest, context: RouteContext) {
    try {
        const id = Number(context.params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        await prisma.users.delete({ where: { id } })
        return NextResponse.json({ message: "Delete User Success!" }, { status: 200 })
    } catch (error: unknown) {
        console.error("DELETE ID User Error:", error)
        return NextResponse.json({ message: "Server DELETE ID User Error!" }, { status: 500 })
    }
}
