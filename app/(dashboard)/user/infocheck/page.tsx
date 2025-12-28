'use client';

import { useState, useEffect } from "react";
// เพิ่ม Icon ใหม่ๆ เพื่อความสวยงาม
import { 
    CalendarDays, 
    Clock, 
    MapPin, 
    CalendarCheck2, 
    AlertCircle, 
    XCircle, 
    CheckCircle2,
    Info
} from 'lucide-react';
import type { appointments } from "@prisma/client";

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
    const [appointment, setAppointment] = useState<appointments[]>([]);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User | null>(null);

    // ดึงข้อมูลผู้ใช้ตอน mount
    const FecthUser = async () => {
        try {
            const res = await fetch('/api/auth/token', {
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
                const res = await fetch(`/api/appointments/check?userId=${data.id}`);
                const result = await res.json();
                setAppointment((result.showAppoinment || []).sort((a: appointments, b: appointments) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                ));

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
        // เพิ่ม confirm ก่อนลบเพื่อความปลอดภัย
        if(!confirm("คุณต้องการยกเลิกการนัดหมายนี้ใช่หรือไม่?")) return;

        try {
            const res = await fetch(`/api/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                alert('ยกเลิกการนัดหมายสำเร็จ !!!');
                // โหลดใหม่
                if (data?.id) {
                    const resReload = await fetch(`/api/appointments/check?userId=${data.id}`);
                    const resultReload = await resReload.json();
                    setAppointment(resultReload.showAppoinment || []);
                }
            }
        } catch (error) {
            console.log("Error canceling:", error);
        }
    };

    return (
        <>
            {/* ส่วนหัวข้อเดิมตามที่ต้องการ */}
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm shadow-md">
                <h1 className="text-xl font-bold">ตรวจสอบการนัดหมาย</h1>
            </div>

            <section className="pb-10">
                <div className="flex justify-center px-4 mt-8">
                    {/* ปรับขนาด: max-w-md สำหรับมือถือ -> md:max-w-3xl สำหรับ PC (ใหญ่ขึ้น) */}
                    <div className="w-full max-w-md md:max-w-3xl bg-white shadow-2xl rounded-3xl p-6 md:p-8 border border-purple-50">

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                                <p>กำลังโหลดข้อมูล...</p>
                            </div>
                        ) : appointment.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <CalendarDays size={64} strokeWidth={1} className="mb-4 opacity-50" />
                                <p className="text-lg">ยังไม่มีประวัติการนัดหมาย</p>
                            </div>
                        ) : (
                            <>
                                {/* หัวข้อการ์ด พร้อม Icon ตกแต่ง */}
                                <div className="flex items-center justify-center gap-3 mb-6 md:mb-8">
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                        <CalendarCheck2 size={28} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        การนัดหมายล่าสุด
                                    </h2>
                                </div>

                                {/* Main Layout: บน PC แบ่งเป็น Grid 2 คอลัมน์ หรือ Flex row */}
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                    
                                    {/* ส่วนหัวสี Gradient */}
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            
                                            {/* วันที่ */}
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                                    <CalendarDays size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-purple-100 text-sm">วันที่นัดหมาย</p>
                                                    <p className="font-bold text-xl md:text-2xl">
                                                        {formatThaiDate(appointment[0].date)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* เส้นแบ่งสำหรับ PC */}
                                            <div className="hidden md:block w-px h-12 bg-white/30"></div>

                                            {/* เวลา */}
                                            <div className="flex items-center gap-4">
                                                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                                                    <Clock size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-purple-100 text-sm">เวลา</p>
                                                    <p className="font-bold text-xl md:text-2xl">
                                                        {appointment[0].time} น.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ส่วนเนื้อหา (Location & Status) */}
                                    <div className="p-6 md:p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                            
                                            {/* ฝั่งซ้าย: สถานที่ */}
                                            <div className="flex items-start gap-4">
                                                <div className="bg-orange-100 p-3 rounded-full text-orange-600 mt-1">
                                                    <MapPin size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm font-medium mb-1">สถานที่</p>
                                                    <p className="text-gray-800 font-semibold text-lg">อาคารสงวนเสริมศรี</p>
                                                    <p className="text-gray-400 text-sm mt-1">มหาวิทยาลัยพะเยา</p>
                                                </div>
                                            </div>

                                            {/* ฝั่งขวา: สถานะ */}
                                            <div className="flex items-start gap-4">
                                                <div className="bg-blue-100 p-3 rounded-full text-blue-600 mt-1">
                                                    <Info size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 text-sm font-medium mb-2">สถานะการนัดหมาย</p>
                                                    
                                                    {(() => {
                                                        const statusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
                                                            "PENDING": { label: "รอการยืนยัน", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <AlertCircle size={16} /> },
                                                            "CONFIRMED": { label: "ยืนยันแล้ว", color: "bg-green-100 text-green-700 border-green-200", icon: <CheckCircle2 size={16} /> },
                                                            "CANCELLED": { label: "ยกเลิกแล้ว", color: "bg-red-100 text-red-700 border-red-200", icon: <XCircle size={16} /> }
                                                        };
                                                        const status = statusMap[appointment[0].status] || statusMap["PENDING"];

                                                        return (
                                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${status.color}`}>
                                                                {status.icon}
                                                                {status.label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* เหตุผลยกเลิก */}
                                        {appointment[0].status === "CANCELLED" && appointment[0].cancelReason && (
                                            <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                                                <div>
                                                    <p className="text-red-800 font-semibold text-sm">เหตุผลที่ถูกยกเลิก:</p>
                                                    <p className="text-red-600 text-sm mt-1">{appointment[0].cancelReason}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* หมายเหตุ */}
                                        <div className="mt-6 pt-6 border-t border-gray-100 text-center md:text-left">
                                            <p className="text-gray-600 text-sm">
                                                <span className="font-semibold text-gray-800">หมายเหตุเพิ่มเติม: </span>
                                                {appointment[0].description || "-"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* ปุ่มยกเลิก (ทำให้ใหญ่ขึ้นและดูเด่นน้อยลงกว่าเนื้อหาหลัก) */}
                                {appointment[0].status !== "CONFIRMED" &&
                                    appointment[0].status !== "CANCELLED" && (
                                        <div className="flex justify-center md:justify-end mt-8">
                                            <button
                                                onClick={() => handleCancel(appointment[0].id)}
                                                className="group flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-500 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all shadow-sm font-medium"
                                            >
                                                <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                                                ยกเลิกการนัดหมาย
                                            </button>
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
};

export default UserInfocheck;