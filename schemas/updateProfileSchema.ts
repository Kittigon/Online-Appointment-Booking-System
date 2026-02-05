import { z } from "zod";

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),

    email: z
        .string()
        .trim()
        .email("รูปแบบอีเมลไม่ถูกต้อง"),

    gender: z
        .string()
        .optional()
        .refine(
            (val) => !val || ["ชาย", "หญิง", "อื่นๆ"].includes(val),
            { message: "ค่าเพศไม่ถูกต้อง" }
        ),

    age: z
        .number()
        .int("อายุต้องเป็นจำนวนเต็ม")
        .min(7, "อายุต้องไม่ต่ำกว่า 7 ปี")
        .max(70, "อายุไม่เกิน 70 ปี")
        .optional(),

    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^0\d{8,9}$/.test(val),
            { message: "เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก และขึ้นต้นด้วย 0" }
        ),

    code: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^\d{6,10}$/.test(val),
            { message: "รหัสต้องเป็นตัวเลข 6–10 หลัก" }
        ),
}).strict();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;