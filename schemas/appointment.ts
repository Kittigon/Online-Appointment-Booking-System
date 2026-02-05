import { z } from 'zod';

export const appointmentSchema = z.object({
    title: z.string().min(3, "หัวเรื่องต้องยาวอย่างน้อย 3 ตัวอักษร").optional(),
    name: z.string().min(2, "กรุณากรอกชื่อพร้อมนามสกุล เช่น นายสมชาย ใจดี"),
    code: z.string().min(8, "กรุณากรอกรหัส ไม่น้อยกว่า 8 ตัวอักษร และไม่เกิน 10 ตัวอักษร").max(10, "กรุณากรอกรหัส ไม่น้อยกว่า 8 ตัวอักษร และไม่เกิน 10 ตัวอักษร"),
    phone: z.string().regex(/^0\d{9}$/, "กรุณากรอกเบอร์โทรศัพท์ที่มี 10 หลักและขึ้นต้นด้วยเลข 0"),
    description: z.string().optional(),
    date: z.string(),
    time: z.string(),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
