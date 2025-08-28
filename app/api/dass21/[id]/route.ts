/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-wrapper-object-types, @typescript-eslint/no-unused-vars */
type SegmentParams<T extends Object = any> = T extends Record<string, any>
    ? { [K in keyof T]: T[K] extends string ? string | string[] | undefined : never }
    : T

type RouteContext = { params: SegmentParams }


import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function DELETE(
    req: Request,
    context: RouteContext
) {
    try {
        const id = Number(context.params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        await prisma.dass_21_result.delete({
            where: { id }
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