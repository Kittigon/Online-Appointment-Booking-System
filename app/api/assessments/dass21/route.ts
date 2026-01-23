import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getCache , setCache , delCache} from "@/utils/cache";

export async function GET() {
    try {
        const cacheKey = 'dass21:all'
        const cached = await getCache(cacheKey)
        if (cached) {
            return NextResponse.json(cached)
        }

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

        await setCache(cacheKey, { dass21List }, 120)

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

        await delCache('dass21:all')

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