import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { appointments } from "@prisma/client";
import { appointmentSchema } from "@/schemas/appointment";
import {getCache , setCache , delCache} from "@/utils/cache";

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
        const cacheKey = 'appointments:all';

        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const showAppoinment: appointments[] = await prisma.appointments.findMany({
            orderBy: [
                { date: "desc" },
                { time: "desc" }
            ]
        })
        await setCache(cacheKey,{ showAppoinment }, 60);
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
    title : string
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
        const { userId, title , name, date, code, phone, time, description } = body;

        const parsed = appointmentSchema.safeParse({title , name, date, code, phone, time, description });
        if (!parsed.success) {
            const errorMessages = parsed.error.issues.map(err => err.message).join("\n");
            return NextResponse.json({ message: errorMessages }, { status: 400 });
        }

        const holiday = await prisma.holiday.findFirst({
            where: { date }
        })

        if (holiday) {
            return NextResponse.json({ message: `ไม่สามารถจองในวันที่ ${formatThaiDate(date)} เนื่องจากเป็นวันหยุด: ${holiday.name}` }, { status: 409 })
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

        const activeAppointment = await prisma.appointments.findFirst({
            where: {
                userId,
                status: {
                    in: ["PENDING", "CONFIRMED"],
                },
            },
            orderBy: {
                date: "desc", // เอานัดล่าสุด
            },
        });

        if (activeAppointment) {
            // ถ้า PENDING → ห้ามจอง
            if (activeAppointment?.status === "PENDING") {
                const pendingDateTime = new Date(
                    `${activeAppointment.date}T${activeAppointment.time}:00`
                );

                if (new Date() < pendingDateTime) {
                    return NextResponse.json(
                        { message: "คุณมีนัดที่ยังไม่ได้ยืนยัน" },
                        { status: 409 }
                    );
                }
            }

            // ถ้า CONFIRMED → เช็กเวลา
            if (activeAppointment.status === "CONFIRMED") {

                const appointmentDateTime = new Date(
                    `${activeAppointment.date}T${activeAppointment.time}:00`
                );

                const now = new Date();

                // ถ้ายังไม่ถึงเวลานัด → ห้ามจอง
                if (now < appointmentDateTime) {
                    return NextResponse.json(
                        {
                            message: "คุณมีนัดที่ได้รับการยืนยันแล้ว กรุณารอถึงวันนัดหมายก่อนจองใหม่",
                        },
                        { status: 409 }
                    );
                }

            }
        }

        const appointment = await prisma.appointments.create({
            data: {
                title,
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

        await delCache("appointments:all");

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

