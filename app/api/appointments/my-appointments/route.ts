import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Status } from "@prisma/client";
import { getCache, setCache } from "@/utils/cache";

// ประวัติการนัดหมาย สำหรับ Mentalhealth
export async function GET() {
    try {
        const cacheKey = 'appointments:my-appointments';
        const cached = await getCache(cacheKey);

        if (cached) {
            return NextResponse.json(cached);
        }

        const appointments = await prisma.appointments.findMany({
            where: {
                status: {
                    in: [Status.COMPLETED, Status.CANCELLED],
                },
            },
            orderBy: [
                { date: "desc" },
                { time: "desc" },
            ],
        });

        await setCache(cacheKey,  appointments , 60); 

        return NextResponse.json(appointments);
    } catch (error) {
        console.error("GET AppointmentHistory Error:", error);
        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        );
    }
}
