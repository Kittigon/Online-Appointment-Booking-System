import {  NextResponse } from "next/server";
import prisma from "@/utils/db";
import { Status } from "@prisma/client";

export async function GET() {
    try {
        const showAppoinment = await prisma.appointments.findMany({
            where: {
                status: Status.CONFIRMED,
            }
        })

        return NextResponse.json(showAppoinment)
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET AppointmentHistory Error:", error.message)
        } else {
            console.error("Unknown error in GET AppointmentHistory:", error)
        }
        return NextResponse.json({ message: "Server Error" }, { status: 500 })
    }
}