'use client';

import { useEffect, useState } from "react";
import type { Notifications, users, appointments } from "@prisma/client";

/* ================= Utils ================= */

const ITEMS_PER_PAGE = 5;

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "2-digit",
        weekday: "long",
    });
};

/* ================= Page ================= */

export default function NotificationsPage() {
    const [tab, setTab] = useState<"noti" | "appoint" | "dass21">("noti");

    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const [appointments, setAppointments] = useState<appointments[]>([]);
    const [dass21, setDass21] = useState<Notifications[]>([]);

    const [user, setUser] = useState<users | null>(null);
    const [loading, setLoading] = useState(true);

    // pagination states
    const [notiPage, setNotiPage] = useState(1);
    const [appointPage, setAppointPage] = useState(1);
    const [dassPage, setDassPage] = useState(1);

    /* ============== Load User ============== */
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/auth/token", {
                    credentials: "include",
                });
                const data = await res.json();
                if (res.ok) setUser(data.user);
            } catch {
                console.log("Load user error");
            }
        };
        loadUser();
    }, []);

    /* ============== Load Data ============== */
    useEffect(() => {
        if (!user?.id) return;

        const loadAll = async () => {
            try {
                const [n, a, d] = await Promise.all([
                    fetch("/api/system/notifications/user/" + user.id),
                    fetch("/api/appointments"),
                    fetch("/api/system/notifications/mentalhealth"),
                ]);

                const notiData = await n.json();
                const appData = await a.json();
                const dassData = await d.json();

                setNotifications(notiData.notifications || []);
                setAppointments(appData.showAppoinment || []);
                setDass21(dassData.DASS21noti || []);
            } catch {
                console.log("Load data error");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [user]);

    /* ============== Reset page when tab changes ============== */
    useEffect(() => {
        setNotiPage(1);
        setAppointPage(1);
        setDassPage(1);
    }, [tab]);

    /* ================= Pagination Logic ================= */

    const notiStart = (notiPage - 1) * ITEMS_PER_PAGE; //คำนวณจุดเริ่มต้นของหน้า 0 , 5 , 10
    const notiItems = notifications.slice(notiStart, notiStart + ITEMS_PER_PAGE); //ตัดช่วงข้อมูล(0 , 5)
    const notiTotal = Math.ceil(notifications.length / ITEMS_PER_PAGE); //คำนวณหน้า

    const appointStart = (appointPage - 1) * ITEMS_PER_PAGE;
    const appointItems = appointments.slice(
        appointStart,
        appointStart + ITEMS_PER_PAGE
    );
    const appointTotal = Math.ceil(appointments.length / ITEMS_PER_PAGE);

    const dassStart = (dassPage - 1) * ITEMS_PER_PAGE;
    const dassItems = dass21.slice(dassStart, dassStart + ITEMS_PER_PAGE);
    const dassTotal = Math.ceil(dass21.length / ITEMS_PER_PAGE);

    /* ================= Render ================= */

    return (
        <>
            {/* Header */}
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
            </div>

            <div className="flex flex-col items-center w-full py-10">
                <div className="w-full max-w-3xl px-6">

                    {/* Tabs */}
                    <div className="flex justify-center gap-3 mb-6">
                        <button
                            onClick={() => setTab("noti")}
                            className={`px-5 py-2 rounded-full font-semibold ${
                                tab === "noti"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100"
                            }`}
                        >
                            การแจ้งเตือน
                        </button>

                        <button
                            onClick={() => setTab("appoint")}
                            className={`px-5 py-2 rounded-full font-semibold ${
                                tab === "appoint"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100"
                            }`}
                        >
                            การนัดหมาย
                        </button>

                        <button
                            onClick={() => setTab("dass21")}
                            className={`px-5 py-2 rounded-full font-semibold ${
                                tab === "dass21"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-100"
                            }`}
                        >
                            แบบประเมิน DASS-21
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <p className="text-center text-gray-500">กำลังโหลด...</p>
                    )}

                    {/* ================= TAB 1: Notifications ================= */}
                    {tab === "noti" && !loading && (
                        <>
                            {notiItems.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    ไม่มีการแจ้งเตือน
                                </p>
                            ) : (
                                <>
                                    {notiItems.map((n) => (
                                        <div
                                            key={n.id}
                                            className="bg-white border rounded-xl p-5 mb-4"
                                        >
                                            <h2 className="font-semibold text-lg">
                                                {n.title}
                                            </h2>
                                            <p className="text-gray-600 whitespace-pre-line">
                                                {n.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatThaiDate(n.createdAt.toString())}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="flex justify-center gap-3 mt-4">
                                        <button
                                            disabled={notiPage === 1}
                                            onClick={() => setNotiPage(notiPage - 1)}
                                        >
                                            ก่อนหน้า
                                        </button>
                                        <span>
                                            หน้า {notiPage} / {notiTotal}
                                        </span>
                                        <button
                                            disabled={notiPage === notiTotal}
                                            onClick={() => setNotiPage(notiPage + 1)}
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* ================= TAB 2: Appointments ================= */}
                    {tab === "appoint" && !loading && (
                        <>
                            {appointItems.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    ไม่มีการนัดหมาย
                                </p>
                            ) : (
                                <>
                                    {appointItems.map((a) => (
                                        <div
                                            key={a.id}
                                            className="bg-white border rounded-xl p-5 mb-4"
                                        >
                                            <h3 className="font-semibold text-lg">
                                                นัดวันที่ {formatThaiDate(a.date)}
                                            </h3>
                                            <p>เวลา: {a.time}</p>
                                            <p className="text-xs text-gray-400">
                                                ผู้จอง: {a.name}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="flex justify-center gap-3 mt-4">
                                        <button
                                            disabled={appointPage === 1}
                                            onClick={() =>
                                                setAppointPage(appointPage - 1)
                                            }
                                        >
                                            ก่อนหน้า
                                        </button>
                                        <span>
                                            หน้า {appointPage} / {appointTotal}
                                        </span>
                                        <button
                                            disabled={appointPage === appointTotal}
                                            onClick={() =>
                                                setAppointPage(appointPage + 1)
                                            }
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* ================= TAB 3: DASS-21 ================= */}
                    {tab === "dass21" && !loading && (
                        <>
                            {dassItems.length === 0 ? (
                                <p className="text-center text-gray-500">
                                    ยังไม่มีการประเมิน
                                </p>
                            ) : (
                                <>
                                    {dassItems.map((d) => (
                                        <div
                                            key={d.id}
                                            className="bg-white border rounded-xl p-5 mb-4"
                                        >
                                            <h2 className="font-semibold text-lg">
                                                {d.title}
                                            </h2>
                                            <p className="text-gray-600 whitespace-pre-line">
                                                {d.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {formatThaiDate(d.createdAt.toString())}
                                            </p>
                                        </div>
                                    ))}

                                    <div className="flex justify-center gap-3 mt-4">
                                        <button
                                            disabled={dassPage === 1}
                                            onClick={() => setDassPage(dassPage - 1)}
                                        >
                                            ก่อนหน้า
                                        </button>
                                        <span>
                                            หน้า {dassPage} / {dassTotal}
                                        </span>
                                        <button
                                            disabled={dassPage === dassTotal}
                                            onClick={() => setDassPage(dassPage + 1)}
                                        >
                                            ถัดไป
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
