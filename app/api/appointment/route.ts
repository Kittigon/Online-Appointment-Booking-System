import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { appointments } from "@prisma/client";
import { appointmentSchema } from "@/schemas/appointment";

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long"
    });
};

//ข้อมูลการนัดหมายทั้งหมด 
export async function GET() {
    try {
        const showAppoinment: appointments[] = await prisma.appointments.findMany({
            orderBy: [
                { date: "desc" },
                { time: "desc" }
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

        const parsed = appointmentSchema.safeParse({ name, date, code, phone, time, description });
        if (!parsed.success) {
            const errorMessages = parsed.error.issues.map(err => err.message).join("\n");
            return NextResponse.json({ message: errorMessages }, { status: 400 });
        }

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

        const appointment = await prisma.appointments.create({
            data: {
                userId,
                name,
                date,
                code,
                phone,
                time,
                description
            }
        });


        // 2) สร้าง Notification ตามเหตุการณ์
        await prisma.notifications.create({
            data: {
                userId,
                type: "APPOINTMENT_CREATED",
                title: "การนัดหมายใหม่ถูกสร้างแล้ว",
                message: `คุณได้สร้างนัดหมายวันที่ ${formatThaiDate(date)} เวลา ${time}`,
                appointmentId: appointment.id
            }
        });

        return NextResponse.json(
            { message: "Create Appointment Success!" },
            { status: 200 }
        );

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("POST Appoinment Error : ", error.message)
        } else {
            console.error("Unknow POST Appoinment Error !", error)
        }
        return NextResponse.json({ message: "Sever POST Appinment Error !" }, { status: 400 })
    }
}

