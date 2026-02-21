'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface SummaryItem {
    user_id: string;
    name?: string;
    phone?: string;
    student_id?: string;
    total: number;
    lastDate?: string;
}

const ITEMS_PER_PAGE = 5;

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
    });
};

const MentalhealthEvaluations = () => {
    const router = useRouter();
    const [data, setData] = useState<SummaryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/assessments/dass21');
            const json = await res.json();
            setData(json.result || []);
        } catch {
            toast.error('โหลดข้อมูลล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    const totalAssessments = data.reduce((sum, item) => sum + item.total, 0);

    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <>
            <div className="bg-[#B67CDE] w-[260px] sm:w-[300px] h-10 text-white p-6 sm:p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-lg sm:text-xl font-bold">
                    สรุปผลแบบประเมิน DASS-21
                </h1>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="text-lg">ไม่พบข้อมูลแบบประเมิน</p>
                </div>
            ) : (
                <div className="flex flex-col items-center mt-10 px-4 w-full">

                    {/* Dashboard Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[1200px] mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <p className="text-gray-500 text-sm">จำนวนผู้ทำแบบประเมิน</p>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
                                {data.length}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center">
                            <p className="text-gray-500 text-sm">จำนวนครั้งทั้งหมด</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
                                {totalAssessments}
                            </p>
                        </div>
                    </div>

                    {/* ✅ Desktop Table */}
                    <div className="hidden md:block bg-white w-full max-w-[1200px] rounded-xl shadow-lg p-6 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-700 text-center">
                                    <th className="border-b p-3">รหัสนักศึกษา</th>
                                    <th className="border-b p-3">ชื่อ</th>
                                    <th className="border-b p-3">เบอร์โทร</th>
                                    <th className="border-b p-3">จำนวนครั้ง</th>
                                    <th className="border-b p-3">ครั้งล่าสุด</th>
                                    <th className="border-b p-3">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item) => (
                                    <tr key={item.user_id} className="text-center hover:bg-gray-50 transition">
                                        <td className="border-b p-3">{item.student_id ?? '-'}</td>
                                        <td className="border-b p-3">{item.name ?? '-'}</td>
                                        <td className="border-b p-3">{item.phone ?? '-'}</td>
                                        <td className="border-b p-3 font-bold text-purple-600">
                                            {item.total}
                                        </td>
                                        <td className="border-b p-3">
                                            {item.lastDate ? formatThaiDate(item.lastDate) : "-"}
                                        </td>
                                        <td className="border-b p-3">
                                            <button
                                                onClick={() =>
                                                    router.push(`/mentalhealth/evaluations/${item.user_id}`)
                                                }
                                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-1 rounded-lg font-medium"
                                            >
                                                ดูประวัติ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Mobile Card Layout */}
                    <div className="md:hidden w-full space-y-4">
                        {currentData.map((item) => (
                            <div key={item.user_id} className="bg-white shadow-md rounded-xl p-4">
                                <p className="font-semibold">{item.name ?? '-'}</p>
                                <p className="text-sm text-gray-500">{item.student_id ?? '-'}</p>
                                <p className="text-sm text-gray-500">{item.phone ?? '-'}</p>

                                <div className="flex justify-between mt-3 text-sm">
                                    <span>จำนวนครั้ง: <b>{item.total}</b></span>
                                    <span>
                                        {item.lastDate ? formatThaiDate(item.lastDate) : "-"}
                                    </span>
                                </div>

                                <button
                                    onClick={() =>
                                        router.push(`/mentalhealth/evaluations/${item.user_id}`)
                                    }
                                    className="mt-4 w-full bg-purple-100 text-purple-700 py-2 rounded-lg font-medium"
                                >
                                    ดูประวัติ
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center mt-8 gap-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            ⬅
                        </button>

                        <span className="font-semibold text-sm sm:text-base">
                            หน้า {currentPage} / {totalPages}
                        </span>

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
                        >
                            ➡
                        </button>
                    </div>

                </div>
            )}
        </>
    );
};

export default MentalhealthEvaluations;