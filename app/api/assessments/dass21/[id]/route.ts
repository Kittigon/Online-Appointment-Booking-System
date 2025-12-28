import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function DELETE(
    req: Request,
    context: { params :Promise<{id: string}> }
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