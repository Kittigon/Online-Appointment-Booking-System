'use client'
import { useState, useEffect } from "react"
import type { appointments } from "@prisma/client"
import { CalendarDays, Clock, User2, Phone, BadgeCheck, CheckCircle, XCircle, Hourglass } from 'lucide-react'

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
};

const MentalhealthHistory = () => {
    const [appointments, setAppointments] = useState<appointments[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`/api/appointments/my-appointments`);
            const data: appointments[] = await res.json();

            // กรอง + เรียงลำดับทันที
            const filteredAndSorted = data
                .filter(item => item.status === "CONFIRMED" || item.status === "CANCELLED")
                .sort((a, b) => {
                    const datetimeA = new Date(`${a.date} ${a.time}`);
                    const datetimeB = new Date(`${b.date} ${b.time}`);
                    return datetimeB.getTime() - datetimeA.getTime(); // ใหม่ → เก่า (DESC)
                });

            setAppointments(filteredAndSorted);

        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
        }

        setLoading(false);
    };


    const StatusIcon = (status: appointments["status"]) => {
        switch (status) {
            case "CONFIRMED": return <span className="flex gap-1.5"><CheckCircle className="w-5 h-5 text-green-600" />ยืนยัน</span>;
            case "PENDING": return <span className="flex gap-1.5"><Hourglass className="w-5 h-5 text-orange-600" />รอดำเนินการ</span>;
            case "CANCELLED": return <span className="flex gap-1.5"><XCircle className="w-5 h-5 text-red-600" />ยกเลิกนัดหมาย</span>;
        }
    };

    console.log(appointments)

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ประวัติผู้ใช้บริการ</h1>
            </div>

            <section className="py-6 mx-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <p className="text-center text-gray-500">ยังไม่มีประวัติการนัดหมาย</p>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {appointments
                            .filter(item => item.status === "CONFIRMED" || item.status === "CANCELLED")
                            .map((item) => (
                                <li
                                    key={item.id}
                                    className="bg-white shadow-md border border-gray-200 p-5 rounded-xl w-full"
                                >
                                    <div className="text-sm sm:text-base space-y-2">
                                        <div className="flex items-center gap-2 text-purple-700 font-semibold">
                                            <User2 size={18} />
                                            <span>ชื่อผู้ใช้: {item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <BadgeCheck size={18} />
                                            <span>รหัสนัดหมาย: {item.code}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone size={18} />
                                            <span>เบอร์โทร: {item.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <CalendarDays size={18} />
                                            <span>วันที่: {formatThaiDate(item.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={18} />
                                            <span>เวลา: {item.time}</span>
                                        </div>
                                        <div className="flex items-start justify-between mt-2">
                                            <p className="text-gray-600 break-words">
                                                <span className="font-medium">หมายเหตุ: </span>{item.description || '-'}
                                            </p>
                                            <p className="flex text-sm">
                                                <strong>สถานะ:</strong>
                                                <span className="text-green-600 font-semibold ml-1">{StatusIcon(item.status)}</span>
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
export default MentalhealthHistory
