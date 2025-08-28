import {  NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { dass_21_result } from "@prisma/client";

export async function GET() {
    try {
        const scoreDASS21: dass_21_result[] = await prisma.dass_21_result.findMany({})

        return NextResponse.json({ scoreDASS21 }, { status: 200 })
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("GET Scorequiz Error : ", error.message)
        } else {
            console.error("Unknow error in GET Scorequiz !", error)
        }
        return NextResponse.json({ message: "Sever GET Scorequiz Error !" }, { status: 400 })
    }
}