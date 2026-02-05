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

}).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
