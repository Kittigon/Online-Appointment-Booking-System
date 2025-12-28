'use client'

import React, { useEffect, useState } from 'react'
import { 
    CalendarDays, 
    Clock, 
    MapPin, 
    CheckCircle2, 
    XCircle, 
    ChevronLeft, 
    ChevronRight,
    AlertCircle 
} from 'lucide-react';
import type { appointments } from '@prisma/client'

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
    const [appointments, setAppointments] = useState<appointments[]>([])
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<User | null>(null)

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // กำหนดจำนวนรายการต่อหน้า

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
                const json = await res.json();
                
                const dataList = Array.isArray(json) ? json : (json.showAppoinment || []);
                
                const filteredData = dataList.filter((item: appointments) => 
                    item.status === 'CONFIRMED' || item.status === 'CANCELLED'
                );
                
                filteredData.sort((a: appointments, b: appointments) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setAppointments(filteredData);
                setCurrentPage(1); // รีเซ็ตไปหน้า 1 ทุกครั้งที่โหลดข้อมูลใหม่
            } catch (error) {
                console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error);
            } finally {
                setLoading(false);
            }
        };

        loadAppointments();
    }, [data?.id]);

    // --- Pagination Logic ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = appointments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(appointments.length / itemsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm shadow-md">
                <h1 className="text-xl font-bold">ประวัติการนัดหมาย</h1>
            </div>

            <section className="py-6 mx-4 ">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                ) : appointments.length === 0 ? (
                    <p className="text-center text-gray-500 mt-10">ยังไม่มีประวัติการนัดหมาย</p>
                ) : (
                    <div className="max-w-7xl mx-auto">
                        <ul className="flex flex-col gap-4">
                            {/* ใช้ currentItems แทน appointments เพื่อแสดงเฉพาะหน้าปัจจุบัน */}
                            {currentItems.map((item) => (
                                <li
                                    key={item.id}
                                    className={`bg-white shadow-sm border-l-4 p-5 rounded-r-lg w-full transition-all hover:shadow-md ${
                                        item.status === 'CANCELLED' ? 'border-l-red-500' : 'border-l-green-500'
                                    }`}
                                >
                                    <div className="text-sm sm:text-base">
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                            
                                            {/* ข้อมูลวันเวลาและสถานที่ */}
                                            <div className="space-y-2 flex-1">
                                                <p className='flex items-center gap-2 text-gray-700'>
                                                    <CalendarDays className="text-purple-600" size={20} />
                                                    <span className="font-bold text-lg">{formatThaiDate(item.date)}</span>
                                                </p>
                                                <p className='flex items-center gap-2 text-gray-600'>
                                                    <Clock className="text-purple-600" size={20} />
                                                    <span>{item.time} น.</span>
                                                </p>
                                                <p className='flex items-center gap-2 text-gray-600'>
                                                    <MapPin className="text-purple-600" size={20} />
                                                    <span>อาคารสงวนเสริมศรี</span>
                                                </p>
                                            </div>

                                            {/* ส่วนแสดงสถานะ, เหตุผลยกเลิก และหมายเหตุ */}
                                            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                                                {/* สถานะ */}
                                                <div className="flex items-center gap-2 md:justify-end">
                                                    <span className="font-semibold text-gray-600">สถานะ:</span>
                                                    {item.status === 'CONFIRMED' ? (
                                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold text-sm border border-green-200">
                                                            <CheckCircle2 size={16} />
                                                            สำเร็จ
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-sm border border-red-200">
                                                            <XCircle size={16} />
                                                            ยกเลิก
                                                        </span>
                                                    )}
                                                </div>

                                                {/* --- แสดงเหตุผลการยกเลิก --- */}
                                                {item.status === 'CANCELLED' && item.cancelReason && (
                                                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-sm w-full md:w-[300px]">
                                                        <div className="flex items-start gap-2 text-red-700">
                                                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                            <div>
                                                                <span className="font-semibold">เหตุผล: </span>
                                                                <span className="text-red-600 break-words">{item.cancelReason}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* หมายเหตุ */}
                                                <p className="text-sm text-gray-500 md:text-right">
                                                    <span className="font-medium text-gray-700">หมายเหตุ: </span> 
                                                    {item.description || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* --- Pagination Controls --- */}
                        {appointments.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                    <span className="hidden sm:inline">ก่อนหน้า</span>
                                </button>
                                
                                <span className="text-sm font-medium text-gray-600">
                                    หน้า {currentPage} จาก {totalPages}
                                </span>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 px-4 py-2 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="hidden sm:inline">ถัดไป</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </>
    )
}

export default UserHistory