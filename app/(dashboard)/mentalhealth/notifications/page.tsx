'use client';

import { useEffect, useState } from "react";
import type { Notifications, users, appointments } from "@prisma/client";

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "2-digit",
        weekday: "long"
    });
};

export default function NotificationsPage() {
    const [tab, setTab] = useState<"noti" | "appoint" | "dass21">("noti");

    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const [appointments, setAppointments] = useState<appointments[]>([]);
    const [dass21, setDass21] = useState<Notifications[]>([]);
    const [user, setUser] = useState<users | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/auth/token", { credentials: "include" });
                const data = await res.json();
                if (res.ok) setUser(data.user);
            } catch {
                console.log("Error loading user");
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const loadAll = async () => {
            try {
                const [n, a, d] = await Promise.all([
                    fetch("/api/system/notifications/user/" + user.id),
                    fetch(`/api/appointments`),
                    fetch(`/api/system/notifications/mentalhealth`),
                ]);

                setNotifications((await n.json()).notifications || []);
                setAppointments((await a.json()).showAppoinment || []);
                setDass21((await d.json()).DASS21noti || []);
            } finally {
                setLoading(false);
            }
        };
        loadAll();
    }, [user]);

    return (
        <>

            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
            </div>

            <div className="flex flex-col items-center w-full py-10">

                {/* Header Bar */}


                <div className="w-full max-w-3xl px-6">

                    {/* Tabs */}
                    <div className="flex justify-center gap-3 mb-6">
                        {[
                            { key: "noti", label: "การแจ้งเตือน" },
                            { key: "appoint", label: "การนัดหมาย" },
                            { key: "dass21", label: "แบบประเมิน DASS-21" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key as "noti" | "appoint" | "dass21")}
                                className={`
                                px-5 py-2 rounded-full text-sm font-semibold transition-all
                                ${tab === t.key
                                        ? "bg-purple-600 text-white shadow-md"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                            `}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Loading */}
                    {loading && <p className="text-center text-gray-500">กำลังโหลด...</p>}

                    {/* TAB 1: Notifications */}
                    {tab === "noti" && !loading && (
                        notifications.length === 0 ? (
                            <p className="text-center text-gray-500">ไม่มีการแจ้งเตือน</p>
                        ) : (
                            <div className="flex flex-col gap-4 items-center">
                                {notifications.map((n) => (
                                    <div key={n.id}
                                        className="w-full rounded-xl border bg-white shadow-sm p-5 max-w-xl">
                                        <h2 className="font-semibold text-lg">{n.title}</h2>
                                        <p className="text-gray-600 mt-1 whitespace-pre-line">
                                            {n.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3">
                                            {formatThaiDate(n.createdAt.toString())}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 2: Appointments */}
                    {tab === "appoint" && !loading && (
                        appointments.length === 0 ? (
                            <p className="text-center text-gray-500">ไม่มีการนัดหมาย</p>
                        ) : (
                            <div className="flex flex-col gap-4 items-center">
                                {appointments.map((a) => (
                                    <div key={a.id}
                                        className="w-full rounded-xl border bg-white shadow-sm p-5 flex gap-4 max-w-xl">
                                    
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                นัดหมายวันที่ {formatThaiDate(a.date)}
                                            </h3>
                                            <p className="text-gray-600 mt-1">
                                                เวลา: {a.time}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                ผู้จอง: {a.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 3: DASS-21 */}
                    {tab === "dass21" && !loading && (
                        dass21.length === 0 ? (
                            <p className="text-center text-gray-500">ยังไม่มีการประเมิน</p>
                        ) : (
                            <div className="flex flex-col gap-4 items-center">
                                {dass21.map((d) => (
                                    <div key={d.id}
                                        className="w-full rounded-xl border bg-white shadow-sm p-5 max-w-xl">
                                        <h2 className="font-semibold text-lg">{d.title}</h2>
                                        <p className="text-gray-600 whitespace-pre-line mt-1">
                                            {d.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-3">
                                            {formatThaiDate(d.createdAt.toString())}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                </div>
            </div>
        </>
    );
}
