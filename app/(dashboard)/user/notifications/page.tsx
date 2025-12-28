'use client';
import { useEffect, useState } from "react";
import type { Notifications, users } from "@prisma/client";

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: '2-digit',
        weekday: 'long'
    });
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const [user, setUser] = useState<users | null>(null);
    const [loading, setLoading] = useState(true);

    // โหลด user ก่อน
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await fetch("/api/auth/token", {
                    method: "GET",
                    credentials: "include"
                });
                const data = await res.json();
                if (res.ok) {
                    setUser(data.user);
                }
            } catch (err) {
                console.log("Error loading user:", err);
            }
        };
        loadUser();
    }, []);

    // โหลด notifications เมื่อมี user
    useEffect(() => {
        if (!user?.id) return;

        const loadNotifications = async () => {
            try {
                const res = await fetch("/api/system/notifications/user/" + user.id);
                const data = await res.json();

                const list = Array.isArray(data)
                    ? data
                    : data?.notifications || [];

                setNotifications(list);
            } catch (err) {
                console.log("Error loading notifications:", err);
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, [user]);

    return (
        <>
            <div className="bg-[#B67CDE] w-[300px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm shadow-md">
                <h1 className="text-xl font-bold">การแจ้งเตือน</h1>
            </div>

            <div className="flex flex-col items-center w-full py-10">
                <div className="w-full max-w-2xl px-4">
                    {loading ? (
                        <p className="text-center text-gray-500">กำลังโหลด...</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-center text-gray-500">ไม่มีการแจ้งเตือน</p>
                    ) : (
                        <div className="flex flex-col gap-4 items-center">
                            {notifications.map((item) => (
                                <div
                                    key={item.id}
                                    className="w-full rounded-2xl border bg-white shadow p-5 max-w-xl"
                                >
                                    <h2 className="font-semibold text-lg">{item.title}</h2>
                                    <p className="text-gray-600 whitespace-pre-line mt-1">
                                        {item.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        {formatThaiDate(item.createdAt.toString())}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
