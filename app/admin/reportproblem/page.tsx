'use client'

import { useState, useEffect } from "react"
import { AlertTriangle, User, Calendar } from "lucide-react"
import type { reportproblems } from "@prisma/client"

interface ReportProblemWithUser extends reportproblems {
    id: number;
    userId: number;
    type: string;
    description: string | null;
    status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
    user?: {
        name: string | null
    }
}

const AdminReportProblem = () => {
    const [reports, setReports] = useState<ReportProblemWithUser[]>([])
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        fetchReportProblems()
    }, [])

    // Filter reports
    const filteredReports = reports.filter(
        (r) => statusFilter === "ALL" || r.status === statusFilter
    )

    // Pagination
    const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentData = filteredReports.slice(startIndex, startIndex + itemsPerPage)

    const fetchReportProblems = async () => {
        try {
            const res = await fetch("/api/reportproblem", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            if (res.ok) {
                const data = await res.json()
                setReports(data)
            } else {
                console.log("Failed to fetch report problems")
            }

        } catch (error) {
            console.log("Error fetching report problems:", error)
        }
    }

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const res = await fetch(`/api/reportproblem/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            })
            if (res.ok) {
                setReports((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, status: newStatus as ReportProblemWithUser["status"] } : r
                    )
                )
                alert("Status updated successfully")
            } else {
                console.log("Failed to update status")
            }
        } catch (error) {
            console.log("Error updating status:", error)
        }
    }


    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-500" /> รายงานปัญหา
            </h2>

            {/* Filter */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value)
                        setCurrentPage(1)
                    }}
                    className="px-3 py-2 border rounded-lg bg-white shadow-sm"
                >
                    <option value="ALL">ทั้งหมด</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {/* Card Layout */}
            <div className="grid gap-4 md:hidden">
                {currentData.map((report) => (
                    <div key={report.id} className="p-4 rounded-xl border shadow-sm bg-white">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-medium">
                            <User className="w-5 h-5 text-purple-600" /> {report.user?.name || "ไม่ระบุชื่อ"}
                        </div>
                        <div className="flex items-center gap-2 mb-1 text-slate-700">
                            <Calendar className="w-5 h-5 text-green-600" />{" "}
                            {report.createdAt instanceof Date
                                ? report.createdAt.toLocaleDateString("th-TH")
                                : new Date(report.createdAt).toLocaleDateString("th-TH")}
                        </div>  
                        <div className="mb-1 text-slate-700 font-medium">{report.type}</div>
                        <div className="mb-2 text-slate-600">{report.description}</div>
                        <span
                            className={`inline-block px-3 py-1 text-sm rounded-full font-medium
                ${report.status === "NEW" ? "bg-blue-100 text-blue-700" : ""}
                ${report.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" : ""}
                ${report.status === "RESOLVED" ? "bg-green-100 text-green-700" : ""}
                ${report.status === "CANCELLED" ? "bg-red-100 text-red-700" : ""}
            `}
                        >
                            <select
                                value={report.status}
                                onChange={(e) => updateStatus(report.id, e.target.value)}
                                className="px-3 py-1 text-sm rounded-lg border bg-white shadow-sm"
                            >
                                <option value="NEW">New</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="RESOLVED">Resolved</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </span>
                    </div>
                ))}
            </div>

            {/* Table Layout */}
            <div className="hidden md:block overflow-x-auto bg-white shadow-md rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-purple-100/80">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">ผู้แจ้ง</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">วันที่แจ้ง</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">ประเภท</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">รายละเอียด</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {currentData.map((report) => (
                            <tr key={report.id} className="hover:bg-purple-50/40 transition">
                                <td className="px-6 py-4 text-slate-800">{report.user?.name || "ไม่ระบุชื่อ"}</td>
                                <td className="px-6 py-4 text-slate-700">
                                    {report.createdAt instanceof Date
                                        ? report.createdAt.toLocaleDateString("th-TH")
                                        : new Date(report.createdAt).toLocaleDateString("th-TH")}
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium">{report.type}</td>
                                <td className="px-6 py-4 text-slate-600">{report.description}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-3 py-1 text-sm rounded-full font-medium
                    ${report.status === "NEW" ? "bg-blue-100 text-blue-700" : ""}
                    ${report.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" : ""}
                    ${report.status === "RESOLVED" ? "bg-green-100 text-green-700" : ""}
                    ${report.status === "CANCELLED" ? "bg-red-100 text-red-700" : ""}
                `}
                                    >
                                        <select
                                            value={report.status}
                                            onChange={(e) => updateStatus(report.id, e.target.value)}
                                            className="px-3 py-1 text-sm rounded-lg border bg-white shadow-sm"
                                        >
                                            <option value="NEW">New</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                    ก่อนหน้า
                </button>
                <span className="px-2 text-slate-700">
                    หน้า {currentPage} / {totalPages}
                </span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                    ถัดไป
                </button>
            </div>
        </div>
    )
}

export default AdminReportProblem
