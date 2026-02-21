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
            <div className="bg-[#B67CDE] w-[260px] sm:w-[300px] h-20 text-white p-6 sm:p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[1200px] mb-10">

                        {/* จำนวนผู้ทำแบบประเมิน */}
                        <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full"></div>

                            <p className="text-sm opacity-80">จำนวนผู้ทำแบบประเมิน</p>
                            <p className="text-4xl font-bold mt-3 tracking-tight">
                                {data.length}
                            </p>

                            <p className="text-xs opacity-70 mt-2">
                                คนที่เคยทำแบบประเมิน DASS-21
                            </p>
                        </div>

                        {/* จำนวนครั้งทั้งหมด */}
                        <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-6 rounded-2xl shadow-lg overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full"></div>

                            <p className="text-sm opacity-80">จำนวนครั้งทั้งหมด</p>
                            <p className="text-4xl font-bold mt-3 tracking-tight">
                                {totalAssessments}
                            </p>

                            <p className="text-xs opacity-70 mt-2">
                                รวมทุกครั้งที่มีการทำแบบประเมิน
                            </p>
                        </div>

                    </div>

                    {/*  Desktop Table */}
                    <div className="hidden md:block bg-white w-full max-w-[1200px] rounded-2xl shadow-xl overflow-hidden">

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">

                                <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">รหัสนักศึกษา</th>
                                        <th className="px-6 py-4">ชื่อ</th>
                                        <th className="px-6 py-4">เบอร์โทร</th>
                                        <th className="px-6 py-4 text-center">จำนวนครั้ง</th>
                                        <th className="px-6 py-4 text-center">ครั้งล่าสุด</th>
                                        <th className="px-6 py-4 text-center">จัดการ</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {currentData.map((item) => (
                                        <tr
                                            key={item.user_id}
                                            className="hover:bg-purple-50/60 transition duration-200"
                                        >
                                            <td className="px-6 py-4 text-gray-700">
                                                {item.student_id ?? "-"}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {item.name ?? "-"}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {item.phone ?? "-"}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-700">
                                                    {item.total}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-center text-gray-600">
                                                {item.lastDate ? formatThaiDate(item.lastDate) : "-"}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/mentalhealth/evaluations/${item.user_id}`)
                                                    }
                                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm hover:shadow-md"
                                                >
                                                    ดูประวัติ
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>

                            </table>
                        </div>
                    </div>

                    {/*  Mobile Card Layout */}
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