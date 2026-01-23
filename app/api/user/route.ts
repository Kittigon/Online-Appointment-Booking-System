import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getCache , setCache } from "@/utils/cache";

type Users = {
    id: number;
    email: string;
    name: string;
    role: string;
    updateAt: Date;
}


export async function GET() {
    try {
        const cacheKey = 'user:all';
        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const showuser:Users[] = await prisma.users.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updateAt: true
            },
        });

        await setCache(cacheKey, { showuser }, 60);

        return NextResponse.json({ showuser }, { status: 200 });

    } catch (error) {
        console.error("GET User Error:", error);
        return NextResponse.json(
            { message: "Server GET User Error" },
            { status: 500 }
        );
    }
}



