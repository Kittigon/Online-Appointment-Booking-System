"use client";

import { useState, useEffect } from "react";

type Report = {
    id: number;
    type: string;
    description: string | null;
    status: string;
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
    const [report, setReports] = useState<Report | null>(null);
    const [data, setData] = useState<Users | null>(null);

    const [loading, setLoading] = useState(true);

    // ดึงข้อมูลผู้ใช้
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

    // useEffect สำหรับโหลดข้อมูลผู้ใช้ตอน mount
    useEffect(() => {
        FecthUser();
    }, []);

    // useEffect สำหรับโหลด report เมื่อ data?.id เปลี่ยน
    useEffect(() => {
        try {
            if (!data?.id) return;
            setLoading(true);
            const loadReports = async () => {
                try {
                    const res = await fetch(`/api/reportproblemprivate?userId=${data.id}`);
                    const json = await res.json();
                    setReports(json);
                } catch (error) {
                    console.error("Error fetching reports:", error);
                }
            };

            loadReports();
        } catch (error) {
            console.error("Error in useEffect for loading reports:", error);
        } finally {
            setLoading(false);
        }
    }, [data?.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data?.id) return;

        try {
            const res = await fetch("/api/reportproblem", {
                method: "POST",
                body: JSON.stringify({ userId: data.id, type, description }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setDescription("");
                // โหลด report ใหม่หลัง submit
                const resReports = await fetch(`/api/reportproblemprivate?userId=${data.id}`);
                const jsonReports = await resReports.json();
                setReports(jsonReports);

                alert("ส่งรายงานปัญหาสำเร็จ");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
        }
    };

    if (loading) {
        return (
            <>
                <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                    <h1 className="text-xl font-bold">รายงานปัญหา</h1>
                </div>
                <div className=" flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">รายงานปัญหา</h1>
            </div>
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                {/* ฟอร์มรายงานปัญหา */}
                <form onSubmit={handleSubmit} className="bg-white shadow rounded-2xl p-6 space-y-4">
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

                {/* แสดงประวัติรายงาน */}
                <div className="bg-white shadow rounded-2xl p-6">
                    <h2 className="text-lg font-semibold mb-4">ประวัติการรายงาน</h2>
                    {!report ? (
                        <p className="text-gray-500">ยังไม่มีการรายงานปัญหา</p>
                    ) : (
                        <div className="border rounded-lg p-4 flex justify-between items-start">
                            <div>
                                <p className="font-medium">📌 {report.type}</p>
                                <p className="text-sm text-gray-600">{report.description}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(report.createdAt).toLocaleString("th-TH")}
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
                    )}
                </div>
            </div>
        </>
    );
};

export default ReportProblem;
