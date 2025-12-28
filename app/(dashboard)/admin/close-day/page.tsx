"use client";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import type { DisabledDate } from "@prisma/client";

registerLocale("th", th);

// คืนค่า yyyy-mm-dd โดยไม่เพี้ยนเวลา
function toLocalDateString(input: string | Date) {
    let date: Date;

    // ถ้าเป็น Date object → ใช้ได้เลย
    if (input instanceof Date) {
        date = new Date(input);
    }
    // ถ้าเป็น string → แปลงเป็น Date
    else {
        date = new Date(input + "T00:00:00");
    }

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);

    return date.toISOString().split("T")[0];
}

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
    });
};

function isFutureDate(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ตัดเวลาเหลือแค่วัน
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
}


export default function CloseDaysPage() {
    const [singleDay, setSingleDay] = useState<Date | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);
    const [disabledDates, setDisabledDates] = useState<DisabledDate[]>([]);

    useEffect(() => {
        fetchDisabledDates();
    }, []);

    const fetchDisabledDates = async () => {
        const res = await fetch("/api/appointments/disabled-date");
        const data = await res.json();
        setDisabledDates(data.disabled);
    };

    const closeSingleDay = async () => {
        if (!singleDay) return alert("กรุณาเลือกวันที่");

        if (!isFutureDate(singleDay)) {
            return alert("ไม่สามารถปิดวันนี้หรือวันในอดีตได้");
        }

        const formatted = toLocalDateString(singleDay);

        const res = await fetch("/api/appointments/disabled-date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: formatted }),
        });

        if (res.ok) {
            alert("ปิดวันสำเร็จ");
            fetchDisabledDates();
        }
    };


    const closeRange = async () => {
        if (!start || !end) return alert("กรุณาเลือกช่วงวันที่");

        if (!isFutureDate(start) || !isFutureDate(end)) {
            return alert("ไม่สามารถปิดวันนี้หรือวันในอดีตได้");
        }

        const startDate = toLocalDateString(start);
        const endDate = toLocalDateString(end);

        const res = await fetch("/api/appointments/disabled-date/range", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startDate, endDate }),
        });

        if (res.ok) {
            alert("ปิดช่วงวันสำเร็จ");
            fetchDisabledDates();
        }
    };

    const openDay = async (date: string) => {
        const res = await fetch("/api/appointments/disabled-date", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date }),
        });

        if (res.ok) {
            alert("เปิดวันสำเร็จ");
            fetchDisabledDates();
        }
    };

    return (
        <>
            <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">ตั้งค่าวันปิดให้บริการ</h2>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">

                <div className="space-y-8">
                    {/* ปิดวันเดียว */}
                    <div className="bg-white shadow rounded-xl p-6 border">
                        <h2 className="text-xl font-semibold mb-3">ปิดวันเดียว</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-700 mb-1">เลือกวันที่</label>

                                <DatePicker
                                    locale="th"
                                    selected={singleDay}
                                    onChange={(date) => setSingleDay(date)}
                                    dateFormat="dd MMMM yyyy"
                                    className="border px-3 py-2 rounded-lg w-full"
                                    placeholderText="เลือกวันที่"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={closeSingleDay}
                                    className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg shadow"
                                >
                                    ปิดวันนี้
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ปิดช่วงวัน */}
                    <div className="bg-white shadow rounded-xl p-6 border">
                        <h2 className="text-xl font-semibold mb-3">ปิดหลายวัน (ช่วงวันที่)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-700 mb-1">วันที่เริ่ม</label>
                                <DatePicker
                                    locale="th"
                                    selected={start}
                                    onChange={(date) => setStart(date)}
                                    dateFormat="dd MMMM yyyy"
                                    className="border px-3 py-2 rounded-lg"
                                    placeholderText="เริ่ม"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="font-medium text-gray-700 mb-1">วันที่สิ้นสุด</label>
                                <DatePicker
                                    locale="th"
                                    selected={end}
                                    onChange={(date) => setEnd(date)}
                                    dateFormat="dd MMMM yyyy"
                                    className="border px-3 py-2 rounded-lg"
                                    placeholderText="สิ้นสุด"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={closeRange}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg shadow"
                                >
                                    ปิดช่วงวัน
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* รายการวันที่ปิด */}
                    <div className="bg-white shadow rounded-xl p-6 border">
                        <h2 className="text-xl font-semibold mb-3">วันที่ถูกปิดทั้งหมด</h2>

                        <div className="space-y-3">
                            {disabledDates.length === 0 ? (
                                <p className="text-gray-500 text-center">ยังไม่มีวันที่ถูกปิด</p>
                            ) : (
                                disabledDates.map((d) => (
                                    <div
                                        key={d.id}
                                        className="flex items-center justify-between border p-3 rounded-lg bg-gray-50"
                                    >
                                        <span className="font-medium">{formatThaiDate(d.date)}</span>

                                        <button
                                            onClick={() => openDay(d.date)}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            เปิดกลับ
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}
