'use client';

import { useState, useEffect } from "react";
import { CalendarDays } from 'lucide-react';
import { Clock } from 'lucide-react';
import { MapPin } from 'lucide-react';

type Appoinment = {
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

const UserHistory = () => {
    const [appointment, setAppointment] = useState<Appoinment[]>([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User | null>(null)

    useEffect(() => {
        FecthUser();
    }, []);

    useEffect(() => {
        if (data?.id) {
            FecthAppoinment();
        }
    }, [data]);

    const FecthAppoinment = async () => {
        const userId = data?.id;
        try {
            const res = await fetch(`/api/appointmentcheck?userId=${userId}`);
            const result = await res.json();
            setAppointment(result.showAppoinment);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("Fetch Appoinment failed:", error.message);
            } else {
                console.log("Unknown error in Fetch Appoinment!", error);
            }
        }
        setLoading(false);
    };

    const FecthUser = async () => {
        try {
            const res = await fetch('/api/token', {
                method: 'GET',
                credentials: "include",
            });

            const data = await res.json();
            // console.log("Data:", data);

            if (res.ok) {
                setData(data.user);
            }
            // } else {
            //     console.log("ไม่พบ token หรือ token ไม่ถูกต้อง:", data.message);
            // }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        }
    }

    const handleCancel = async (id: number) => {
        try {
            const res = await fetch(`/api/appointment/` + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('ยกเลิกการนัดหมายสำเร็จ !!! ')
                FecthAppoinment();
            }

        } catch (error) {
            if (error instanceof Error) {
                console.log("Cancel Appoinment failed:", error.message);
            } else {
                console.log("Unknown error in Cancel Appoinment!", error);
            }
        }
    };

    // console.log(data)

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ตรวจสอบการนัดหมาย</h1>
            </div>

            <section>
                <div className="mx-auto p-4">
                    <div className=" bg-white shadow-md rounded-lg p-10">
                        {loading ? (
                            <p className="text-center text-gray-500">กำลังโหลด...</p>
                        ) : appointment.length === 0 ? (
                            <p className="text-center text-gray-500">ยังไม่มีประวัติการนัดหมาย</p>
                        ) : (
                            <ul className="space-y-4">
                                {appointment.map((item) => (
                                    <li key={item.id} className="border-b pb-4">
                                        <div className="flex flex-col  gap-2">
                                            <div className="text-sm text-gray-800 font-medium break-words flex items-center gap-2">
                                                <CalendarDays />
                                                <span className="font-bold ">{formatThaiDate(item.date)}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Clock />
                                                <span >{item.time}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                <MapPin/>
                                                <span> อาคารสงวนเสริมศรี </span>
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-600 break-words mt-1 md:flex md:flex-row justify-between items-center">
                                            <span>หมายเหตุ : {item.description || "-"}</span>

                                            {/* ปุ่มยกเลิก เฉพาะถ้ายังไม่ "ยกเลิก" หรือ "สำเร็จ" */}
                                            {item.status !== 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleCancel(item.id)}
                                                    className="mt-3 w-full sm:w-auto px-4 py-1 bg-red-500 text-white text-sm  rounded-full hover:bg-red-600 transition"
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

export default UserHistory;
