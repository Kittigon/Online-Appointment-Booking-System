import { z } from 'zod';

export const appointmentSchema = z.object({
    name: z.string().min(2, "กรุณากรอกชื่อ"),
    code: z.string().min(8, "กรุณากรอกรหัส"),
    phone: z.string().regex(/^0\d{9}$/, "เบอร์โทรไม่ถูกต้อง"),
    description: z.string().optional(),
    date: z.string(),
    time: z.string(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
