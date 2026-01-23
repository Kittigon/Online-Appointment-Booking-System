'use client';

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type Report = {
    id: number;
    type: string;
    description: string | null;
    status: "NEW" | "IN_PROGRESS" | "RESOLVED";
    createdAt: string;
};

type Users = {
    id: number;
    email: string;
    name: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
};

const ReportProblem = () => {
    const [type, setType] = useState("ระบบล่ม");
    const [description, setDescription] = useState("");

    const [reports, setReports] = useState<Report[]>([]);
    const [user, setUser] = useState<Users | null>(null);

    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const limit = 3; // จำนวนรายการต่อหน้า

    // ดึงข้อมูลผู้ใช้
    const fetchUser = async () => {
        try {
            const res = await fetch("/api/auth/token", {
                method: "GET",
                credentials: "include",
            });

            const json = await res.json();
            if (res.ok) {
                setUser(json.user);
            }
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // ดึงรายงานทั้งหมดของผู้ใช้
    const fetchReports = async (userId: number) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/reports/private?userId=${userId}`);
            const json = await res.json();

            if (Array.isArray(json)) {
                setReports(json);
            } else {
                setReports([]);
            }

            setPage(1); // โหลดใหม่ → กลับหน้าแรกเสมอ
        } catch (error) {
            console.error(error);
            toast.error("ไม่สามารถโหลดประวัติรายงานได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchReports(user.id);
        }
    }, [user?.id]);

    // ส่งรายงานปัญหา
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    type,
                    description,
                }),
            });

            if (!res.ok) throw new Error("Submit failed");

            setDescription("");
            await fetchReports(user.id);

            toast.success("ส่งรายงานปัญหาสำเร็จ");
        } catch (error) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาดในการส่งรายงานปัญหา");
        }
    };

    // Pagination Logic (Frontend)
    const totalPages = Math.ceil(reports.length / limit);

    const paginatedReports = reports.slice(
        (page - 1) * limit,
        page * limit
    );

    // Loading UI
    if (loading) {
        return (
            <>
                <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                    <h1 className="text-xl font-bold">รายงานปัญหา</h1>
                </div>

                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </>
        );
    }

    // Main UI
    return (
        <>
            <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">รายงานปัญหา</h1>
            </div>

            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* ================= Form ================= */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow rounded-2xl p-6 space-y-4"
                >
                    <div>
                        <label className="block mb-2 text-xl font-medium text-gray-700">
                            ประเภทปัญหา
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option>ระบบล่ม</option>
                            <option>ไม่สามารถจองได้</option>
                            <option>เกิดข้อผิดพลาด</option>
                            <option>ปัญหาเกี่ยวกับบัญชีผู้ใช้</option>
                            <option>อื่นๆ</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            รายละเอียด
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full border rounded-lg p-2"
                            placeholder="อธิบายปัญหาที่คุณพบ..."
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
                    >
                        ส่งรายงาน
                    </button>
                </form>

                {/* ================= History ================= */}
                <div className="bg-white shadow rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        ประวัติการรายงาน
                    </h2>

                    {paginatedReports.length === 0 ? (
                        <p className="text-gray-500">
                            ยังไม่มีการรายงานปัญหา
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {paginatedReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="border rounded-lg p-4 flex justify-between items-start"
                                >
                                    <div>
                                        <p className="font-medium">
                                            📌 {report.type}
                                        </p>
                                        {report.description && (
                                            <p className="text-sm text-gray-600">
                                                {report.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400">
                                            {new Date(
                                                report.createdAt
                                            ).toLocaleString("th-TH")}
                                        </p>
                                    </div>

                                    <span
                                        className={`px-2 py-1 rounded-lg text-xs font-medium ${report.status === "NEW"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : report.status === "IN_PROGRESS"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                    >
                                        {report.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ================= Pagination UI ================= */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1 rounded-lg border disabled:opacity-50"
                            >
                                ◀ ก่อนหน้า
                            </button>

                            <span className="text-sm text-gray-600">
                                หน้า {page} / {totalPages}
                            </span>

                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 rounded-lg border disabled:opacity-50"
                            >
                                ถัดไป ▶
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ReportProblem;
