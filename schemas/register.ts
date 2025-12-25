import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("รูปแบบอีเมลไม่ถูกต้อง"),

    password: z
        .string()
        .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว")
        .regex(/[A-Z]/, "รหัสผ่านต้องมีตัวพิมพ์ใหญ่")
        .regex(/[a-z]/, "รหัสผ่านต้องมีตัวพิมพ์เล็ก")
        .regex(/[0-9]/, "รหัสผ่านต้องมีตัวเลข"),

    gender: z
        .string()
        .optional()
        .refine(
            (val) => !val || ["ชาย", "หญิง", "อื่นๆ"].includes(val),
            { message: "ค่าเพศไม่ถูกต้อง" }
        ),

    age: z.coerce
        .number()
        .refine((val) => !isNaN(val), {
            message: "อายุต้องเป็นตัวเลข",
        })
        .int("อายุต้องเป็นจำนวนเต็ม")
        .min(18, "อายุต้องไม่ต่ำกว่า 18 ปี")
        .max(120, "อายุต้องไม่มากกว่าอยู่ระหว่าง 120 ปี"),
}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
