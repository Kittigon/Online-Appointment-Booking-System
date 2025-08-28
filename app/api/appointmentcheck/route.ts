import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

//หาข้อมูลการนัดหมายของผู้ใช้งาน
export async function GET(req: NextRequest) {
    try {
        const userId = Number(req.nextUrl.searchParams.get("userId"))
        // console.log(userId)

        if (isNaN(userId)) {
            return NextResponse.json({ message: "Missing or invalid userId" }, { status: 400 });
        }

        const showAppoinment = await prisma.appointments.findMany({
            where: {
                userId: userId
            },
            orderBy: [
                { date: 'desc' },
                { time: 'desc' }]
        });

        return NextResponse.json({ showAppoinment });

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET ID Appoinment Error : ", error.message)
        } else {
            console.error("Unknow error in GET ID Appoinment ! ", error)
        }
        return NextResponse.json({ message: "Sever GET ID Appoinment Error !" }, { status: 400 })
    }
}