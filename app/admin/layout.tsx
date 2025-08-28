// app/admin/layout.js
"use client";

import { useState } from "react";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ClipboardList,
    AlertTriangle,
    UserCog,
    KeyRound,
    LogOut,
    Menu
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";


export default function AdminLayout({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/logout', {
                method: 'POST',
                credentials: "include",
            });

            if (res.ok) {
                window.location.href = '/login'; 
            } else {
                const errorData = await res.json();
                console.error("Logout failed:", errorData.error);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Logout Error: ", error.message);
            } else {
                console.error("Unknown error in logout: ", error);
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-pink-50 flex">
            {/* Sidebar */}
            <aside
                className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-slate-200 p-5
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static
        `}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="font-bold text-2xl text-purple-700 tracking-wide">MH Admin</h1>
                    <button
                        className="md:hidden text-slate-600 hover:text-slate-900"
                        onClick={() => setSidebarOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 text-sm">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <LayoutDashboard className="w-5 h-5" /> Dashboard
                    </Link>

                    <Link
                        href="/admin/manage"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <Users className="w-5 h-5" /> จัดการผู้ใช้
                    </Link>

                    <Link
                        href="/admin/appointment"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <CalendarDays className="w-5 h-5" /> นัดหมาย
                    </Link>

                    <Link
                        href="/admin/evaluations"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <ClipboardList className="w-5 h-5" /> การทำแบบประเมิน
                    </Link>

                    <Link
                        href="/admin/reportproblem"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <AlertTriangle className="w-5 h-5" /> รายงานปัญหา
                    </Link>

                    <Link
                        href="/admin/profile"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <UserCog className="w-5 h-5" /> โปรไฟล์
                    </Link>

                    <Link
                        href="/admin/changepassword"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-purple-100 text-slate-700 hover:text-purple-700 transition"
                    >
                        <KeyRound className="w-5 h-5" /> เปลี่ยนรหัสผ่าน
                    </Link>

                    <button
                        onClick={() => { handleLogout() }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-700 transition"
                    >
                        <LogOut className="w-5 h-5" /> ออกจากระบบ
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 space-y-8 overflow-x-auto">
                {/* ปุ่มเปิด sidebar (เฉพาะ mobile) */}
                <button
                    className="md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-purple-50 transition"
                    onClick={() => setSidebarOpen(true)}
                >
                    <Menu className="w-5 h-5 text-purple-600" /> เมนู
                </button>

                {children}
            </main>
        </div>
    );
}
