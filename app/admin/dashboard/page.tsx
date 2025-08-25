"use client";

import {
    AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Alert {
    id: number;
    message: string;
    createdAt: string;
}

export default function AdminDashboardSimple() {
    const [userCount, setUserCount] = useState(0);
    const [reportCount, setReportCount] = useState(0);
    const [assessmentCount, setAssessmentCount] = useState(0);
    const [riskAlertCount, setRiskAlertCount] = useState(0);
    const [recentAlerts, setRecentAlerts] = useState([] as Alert[]);

    useEffect(() => {
        fetchCount();
    }, []);

    const fetchCount = async () => {
        try {
            const res = await fetch('/api/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (res.ok) {
                const data = await res.json();
                setUserCount(data.userCount);
                setReportCount(data.reportCount);
                setAssessmentCount(data.assessmentCount);
                setRiskAlertCount(data.riskAlertCount);
                setRecentAlerts(data.recentAlerts);
            } else {
                console.error("Failed to fetch user count");
            }

        } catch (error) {
            console.error("Error fetching user count:", error);
        }
    }

    const timeAgo = (dateString : string) => {
        const now = new Date();
        const past = new Date(dateString);
        const diff = (now.getTime() - past.getTime()) / 1000; // diff เป็นวินาที

        if (diff < 60) return `${Math.floor(diff)} วินาทีที่แล้ว`;
        if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`;
        return `${Math.floor(diff / 86400)} วันก่อน`;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex">

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 space-y-8">
                {/* Title */}
                <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border">
                        <p className="text-sm text-slate-500">ผู้ใช้ทั้งหมด</p>
                        <p className="text-3xl font-bold text-purple-700">{userCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border">
                        <p className="text-sm text-slate-500">รายงานปัญหา</p>
                        <p className="text-3xl font-bold text-orange-600">{reportCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border">
                        <p className="text-sm text-slate-500">ทำแบบประเมิน</p>
                        <p className="text-3xl font-bold text-green-600">{assessmentCount}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition border">
                        <p className="text-sm text-slate-500">แจ้งเตือนความเสี่ยง</p>
                        <p className="text-3xl font-bold text-red-600">{riskAlertCount}</p>
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="bg-white p-6 rounded-xl shadow border">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
                        <AlertTriangle className="w-5 h-5 text-red-500" /> แจ้งเตือนล่าสุด
                    </h3>
                    <ul className="space-y-3 text-slate-700">
                        {recentAlerts.length === 0 ? (
                            <p className="text-slate-500">ยังไม่มีการแจ้งเตือน</p>
                        ) : (
                            recentAlerts.map(alert => (
                                <li
                                    key={alert.id}
                                    className="p-3 bg-slate-50 rounded-lg border hover:bg-slate-100 transition flex justify-between"
                                >
                                    <span>{alert.message}</span>
                                    <span className="text-sm text-slate-500">{timeAgo(alert.createdAt)}</span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </main>
        </div>
    );
}
