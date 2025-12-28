import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET() {
    try {
        const dass21List = await prisma.dass_21_result.findMany({
            include:{
                user_consent:{
                    select:{
                        name:true,
                        phone:true,
                        student_id:true
                    }
                }
            }
        })

        return NextResponse.json({ dass21List })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET DASS21 Error : ", error.message)
        } else {
            console.error("Unknow error in GET DASS21 ! ", error)
        }
        return NextResponse.json({ message: "Sever GET DASS21 Error !" }, { status: 400 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { user_id } = body;
        await prisma.dass_21_result.create({
            data: {
                user_id
            }
        })

        return NextResponse.json({ message: "Create DASS21 Success!" })

    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET DASS21 Error : ", error.message)
        } else {
            console.error("Unknow error in GET DASS21 ! ", error)
        }
        return NextResponse.json({ message: "Sever GET DASS21 Error !" }, { status: 400 })
    }
}