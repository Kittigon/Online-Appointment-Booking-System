'use client'

import { useEffect, useState } from 'react'
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

const UserHistory = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User | null>(null)

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
                const res = await fetch(`/api/appointmenthistory?userId=${data.id}`);
                const result: Appointment[] = await res.json();
                const confirmedOnly = result.filter(item => item.status === 'CONFIRMED');
                setAppointments(confirmedOnly);
                setLoading(false);
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
            }
        };

        loadAppointments();
    }, [data?.id]);

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ประวัติการนัดหมาย</h1>
            </div>

            <section className="py-6 mx-4">
                {loading ? (
                    <p className="text-center text-gray-500">กำลังโหลด...</p>
                ) : appointments.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีประวัติการนัดหมาย</p>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {appointments.map((item) => (
                            <li
                                key={item.id}
                                className="bg-white shadow-sm border border-gray-200 p-5 rounded-lg w-full"
                            >
                                <div className="text-sm sm:text-base">
                                    <p className='flex items-center gap-2 mb-2.5'>
                                        <CalendarDays />
                                        <strong>{formatThaiDate(item.date)}</strong>
                                    </p>
                                    <p className='flex items-center gap-2 mb-2.5'>
                                        <Clock />
                                        <strong></strong> {item.time}
                                    </p>
                                    <p className='flex items-center gap-2 mb-2.5'>
                                        <MapPin />
                                        <span> อาคารสงวนเสริมศรี </span>
                                    </p>
                                    <div className='flex justify-between'>
                                        <p> <span className='text-sm text-gray-600 break-words mt-1 pl-1 '>หมายเหตุ : </span> {item.description || '-'}</p>
                                        <p><strong>สถานะ:</strong>
                                            <span className="text-green-600 font-semibold ml-1">สำเร็จ</span>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </>
    )
}

export default UserHistory
