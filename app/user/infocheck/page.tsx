'use client';

import { useState, useEffect } from "react";
import { CalendarDays, Clock, MapPin } from 'lucide-react';

type Appointment = {
    id: number;
    userId: number;
    date: string;
    time: string;
    code: string;
    phone: string;
    status: string;
    description: string | null
}

type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
};

const UserInfocheck = () => {
    const [appointment, setAppointment] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User | null>(null);

    // ดึงข้อมูลผู้ใช้ตอน mount
    const FecthUser = async () => {
        try {
            const res = await fetch('/api/token', {
                method: 'GET',
                credentials: "include",
            });

            const json = await res.json();
            if (res.ok) {
                setData(json.user);
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        }
    };

    useEffect(() => {
        FecthUser();
    }, []);

    // โหลด appointment เมื่อ data?.id เปลี่ยน
    useEffect(() => {
        if (!data?.id) return;

        const loadAppointments = async () => {
            try {
                const res = await fetch(`/api/appointmentcheck?userId=${data.id}`);
                const result = await res.json();
                setAppointment(result.showAppoinment || []);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    console.log("Fetch Appointment failed:", error.message);
                } else {
                    console.log("Unknown error in Fetch Appointment!", error);
                }
            }
            setLoading(false);
        };

        loadAppointments();
    }, [data?.id]);

    const handleCancel = async (id: number) => {
        try {
            const res = await fetch(`/api/appointment/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('ยกเลิกการนัดหมายสำเร็จ !!!');
                // โหลดใหม่
                if (data?.id) {
                    const resReload = await fetch(`/api/appointmentcheck?userId=${data.id}`);
                    const resultReload = await resReload.json();
                    setAppointment(resultReload.showAppoinment || []);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.log("Cancel Appointment failed:", error.message);
            } else {
                console.log("Unknown error in Cancel Appointment!", error);
            }
        }
    };

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ตรวจสอบการนัดหมาย</h1>
            </div>

            <section>
                <div className="mx-auto p-4">
                    <div className="bg-white shadow-md rounded-lg p-10">
                        {loading ? (
                            <p className="text-center text-gray-500">กำลังโหลด...</p>
                        ) : appointment.length === 0 ? (
                            <p className="text-center text-gray-500">ยังไม่มีประวัติการนัดหมาย</p>
                        ) : (
                            <ul className="space-y-4">
                                {appointment.map((item) => (
                                    <li key={item.id} className="border-b pb-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-sm text-gray-800 font-medium break-words flex items-center gap-2">
                                                <CalendarDays />
                                                <span className="font-bold">{formatThaiDate(item.date)}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Clock />
                                                <span>{item.time}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <MapPin />
                                                <span> อาคารสงวนเสริมศรี </span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 break-words mt-1 md:flex md:flex-row justify-between items-center">
                                            <span>หมายเหตุ : {item.description || "-"}</span>
                                            {item.status !== 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleCancel(item.id)}
                                                    className="mt-3 w-full sm:w-auto px-4 py-1 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition"
                                                >
                                                    ยกเลิกนัดหมาย
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default UserInfocheck;
