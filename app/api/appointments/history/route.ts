import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/db"
import { Status } from "@prisma/client"


export async function GET(req: NextRequest) {
    try {
        const userIdParam = req.nextUrl.searchParams.get("userId")
        const userId = userIdParam ? Number(userIdParam) : NaN

        if (isNaN(userId)) {
            return NextResponse.json({ message: "Missing or invalid userId" }, { status: 400 })
        }

        const now = new Date()

        // ดึงเฉพาะนัดหมายที่ยังไม่ CONFIRMED
        const appointmentsToUpdate = await prisma.appointments.findMany({
            where: {
                userId,
                status: { not: Status.CONFIRMED },
            },
        })

        const updatesToPerform: number[] = []

        for (const app of appointmentsToUpdate) {
            const appointmentDateTime = new Date(`${app.date}T${app.time}`)
            if (appointmentDateTime < now) {
                updatesToPerform.push(app.id)
            }
        }

        // อัปเดตสถานะเป็น CONFIRMED ทีเดียว
        if (updatesToPerform.length > 0) {
            await prisma.appointments.updateMany({
                where: {
                    id: { in: updatesToPerform },
                },
                data: {
                    status: Status.CONFIRMED,
                },
            })
        }

        // ดึงข้อมูลล่าสุดของผู้ใช้ เรียงตามวันและเวลา
        const finalAppointments = await prisma.appointments.findMany({
            where: { userId },
            orderBy: [{ date: "desc" }, { time: "desc" }],
        })

        return NextResponse.json(finalAppointments)

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET AppointmentHistory Error:", error.message)
        } else {
            console.error("Unknown error in GET AppointmentHistory:", error)
        }
        return NextResponse.json({ message: "Server Error" }, { status: 500 })
    }
}
