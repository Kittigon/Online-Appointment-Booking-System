import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import type { users } from "@prisma/client";

export async function GET() {
    try {
        const showuser: users[] = await prisma.users.findMany({})
        return NextResponse.json( showuser )
    } catch (error: unknown) {
        if(error instanceof Error){
            console.error("GET User Error : ",error.message)
        }else{
            console.error("Unknow error in GET User : ",error)
        }
        return NextResponse.json({ message: "Sever GET User Error ! " }, { status: 400 })
    }
}



