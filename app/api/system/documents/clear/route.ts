import { createClient } from "@supabase/supabase-js";

export async function DELETE() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
        .from("documents")
        .delete()
        .neq("id", 0); // trick: ลบทุกแถว

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return new Response(
        JSON.stringify({ message: "ลบข้อมูลทั้งหมดเรียบร้อย" }),
        { status: 200 }
    );
}
