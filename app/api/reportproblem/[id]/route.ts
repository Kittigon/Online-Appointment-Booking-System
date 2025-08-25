import { NextRequest , NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { reportproblems } from "@prisma/client";

// แก้ไขฟอร์มปัญหาจากผู้ใช้งาน
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const body = await req.json();
    const { type , description} = body as reportproblems;
    const id = parseInt(params.id)
    try {
        await prisma.reportproblems.update({
            where: {
                id: id
            },
            data: {
                type,
                description
            }
        })

        return NextResponse.json({ message: "Update Report a Problem Success !" }, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Update Report a Problem Error : ", error.message)
        } else {
            console.error("Unknown error in Update Report a Problem : ", error)
        }
        return NextResponse.json({ message: "Sever Update Report a Problem Error !" }, { status: 400 })
    }
}

export async function PATCH( req: NextRequest,{ params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id)
        const {status} = await req.json()  
        await prisma.reportproblems.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json({ message: "Report a Problem status updated successfully" }, { status: 200 })
    } catch (error) {
        
    }
}

// ลบฟอร์มปัญหาจากผู้ใช้งาน
export async function DELETE( req: NextRequest,{ params }: { params: { id: string } }) {
    const id = parseInt(params.id)
    try {
        await prisma.reportproblems.delete({
            where: {
                id
            }
        })

        return NextResponse.json({ message: "Delete Report a Problem Success !" }, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Delete Report a Problem Error : ", error.message)
        } else {
            console.error("Unknown error in Delete Report a Problem : ", error)
        }
        return NextResponse.json({ message: "Sever Delete Report a Problem Error !" }, { status: 400 })
    }
}