import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { appointments } from "@prisma/client";



//ข้อมูลการนัดหมายทั้งหมด 
export async function GET() {
    try {
        const showAppoinment: appointments[] = await prisma.appointments.findMany({
            orderBy: [
                { date: "desc" }
            ]
        })
        return NextResponse.json({ showAppoinment }, { status: 200 })

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET Appoinment Error : ", error.message)
        } else {
            console.error("Unknow error in GET Appoinment ! ", error)
        }
        return NextResponse.json({ message: "Sever GET Appoinment Error !" }, { status: 400 })
    }
}

interface CreateAppoinment {
    userId: number;
    name: string;
    date: string;
    code: string;
    phone: string;
    time: string;
    description?: string;

}

// สร้างการนัดหมาย 
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as CreateAppoinment
        const { userId, name, date, code, phone, time, description } = body;

        const exists = await prisma.appointments.findFirst({
            where: {
                date,
                time
            }
        })

        if (exists) {
            console.log(exists)
            return NextResponse.json({ message: "มีการจองในวันและเวลาดังกล่าวแล้ว " }, { status: 409 })
        }

        await prisma.appointments.create({
            data: {
                userId: userId,
                name: name,
                date: date,
                code: code,
                phone: phone,
                time: time,
                description: description
            }
        })

        return NextResponse.json({ message: "Create Appoinment Success !" }, { status: 200 })

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("POST Appoinment Error : ", error.message)
        } else {
            console.error("Unknow POST Appoinment Error !", error)
        }
        return NextResponse.json({ message: "Sever POST Appinment Error !" }, { status: 400 })
    }
}

