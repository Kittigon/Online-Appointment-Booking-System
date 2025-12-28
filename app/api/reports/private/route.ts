import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET(req: NextRequest) {
    try {
        const userId = Number(req.nextUrl.searchParams.get("userId"))
        // console.log(userId)

        if (isNaN(userId)) {
            return NextResponse.json({ message: "Missing or invalid userId" }, { status: 400 });
        }

        const reportproblem = await prisma.reportproblems.findFirst({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json(reportproblem, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Get Report a Problem Error : ", error.message)
        } else {
            console.error("Unknown error in Get Report a Problem : ", error)
        }
        return NextResponse.json({ message: "Sever Get Report a Problem Error !" }, { status: 400 })
    }
}