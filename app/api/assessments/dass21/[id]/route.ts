import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { delCache } from "@/utils/cache";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }   
) {
    try {
        const token = (await cookies()).get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            role: string;
        };

        if (decoded.role !== "MENTALHEALTH") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // เปลี่ยนตรงนี้
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ message: "Missing user id" }, { status: 400 });
        }

        const data = await prisma.dass_21_result.findMany({
            where: { user_id: id },   
            include: {
                dass_21_answer: true,
                user_consent: true
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json(data);

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const id = await context.params;
        const idNum = Number(id.id);
        if (isNaN(idNum)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await prisma.dass_21_result.delete({
            where: { id: idNum },
        });

        await delCache('dass21:all')

        return NextResponse.json({ message: "Delete User Success !" }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("DELETE ID DASS21 Error : ", error.message);
        } else {
            console.error("Unknown error in DELETE ID DASS21 ! ", error);
        }
        return NextResponse.json({ message: "Server DELETE ID DASS21 Error!" }, { status: 500 });
    }
}