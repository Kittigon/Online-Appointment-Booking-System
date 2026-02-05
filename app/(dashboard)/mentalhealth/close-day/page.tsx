"use client";

import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import type { DisabledDate } from "@prisma/client";
import { toast } from "react-hot-toast";

registerLocale("th", th);

/* ================= utils ================= */
function toLocalDateString(input: string | Date) {
    const date: Date =
        input instanceof Date ? new Date(input) : new Date(input + "T00:00:00");

    const offset = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() - offset);

    return date.toISOString().split("T")[0];
}

const formatThaiDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
    });

function isFutureDate(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() > today.getTime();
}

/* ================= types ================= */
type Holiday = {
    id: number;
    date: string;
    name: string;
    type: string;
};

const EMPTY_HOLIDAY: Holiday = {
    id: 0,
    date: "",
    name: "",
    type: "NATIONAL",
};

const HOLIDAY_TYPE_MAP: Record<string, string> = {
    NATIONAL: "วันหยุดราชการ",
    SPECIAL: "วันหยุดพิเศษ",
    RELIGIOUS: "วันทางศาสนา",
    OTHER: "อื่น ๆ",
};

/* ================= small components ================= */
function Card({
    title,
    children,
}: {
    title: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border shadow-sm rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            {children}
        </div>
    );
}

function Pagination({
    page,
    totalPages,
    onChange,
}: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-3 pt-3">
            <button
                disabled={page === 1}
                onClick={() => onChange(page - 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
                ก่อนหน้า
            </button>
            <span className="text-sm text-gray-600">
                หน้า {page} / {totalPages}
            </span>
            <button
                disabled={page === totalPages}
                onClick={() => onChange(page + 1)}
                className="px-3 py-1 border rounded-lg disabled:opacity-40"
            >
                ถัดไป
            </button>
        </div>
    );
}

/* ================= main ================= */
export default function CloseDaysPage() {
    const [singleDay, setSingleDay] = useState<Date | null>(null);
    const [start, setStart] = useState<Date | null>(null);
    const [end, setEnd] = useState<Date | null>(null);

    const [disabledDates, setDisabledDates] = useState<DisabledDate[]>([]);
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [editing, setEditing] = useState<Holiday | null>(null);

    /* pagination */
    const ITEMS_PER_PAGE = 5;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(holidays.length / ITEMS_PER_PAGE);
    const paginatedHolidays = holidays.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    /* ================= fetch ================= */
    useEffect(() => {
        fetchDisabledDates();
        fetchHolidays();
    }, []);

    const fetchDisabledDates = async () => {
        try {
            const res = await fetch("/api/appointments/disabled-date");
            const data = await res.json();
            setDisabledDates(Array.isArray(data?.disabled) ? data.disabled : []);
        } catch {
            setDisabledDates([]);
        }
    };

    const fetchHolidays = async () => {
        try {
            const res = await fetch("/api/system/holidays");
            const data = await res.json();
            setHolidays(Array.isArray(data) ? data : []);
        } catch {
            setHolidays([]);
        }
    };

    /* ================= actions ================= */
    const closeSingleDay = async () => {
        if (!singleDay) return toast.error("กรุณาเลือกวันที่");
        if (!isFutureDate(singleDay))
            return toast.error("ไม่สามารถปิดวันนี้หรือวันในอดีตได้");

        const res = await fetch("/api/appointments/disabled-date", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: toLocalDateString(singleDay) }),
        });

        if (res.ok) {
            toast.success("ปิดวันสำเร็จ");
            fetchDisabledDates();
        }
    };

    const closeRange = async () => {
        if (!start || !end) return toast.error("กรุณาเลือกช่วงวันที่");

        const res = await fetch("/api/appointments/disabled-date/range", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                startDate: toLocalDateString(start),
                endDate: toLocalDateString(end),
            }),
        });

        if (res.ok) {
            toast.success("ปิดช่วงวันสำเร็จ");
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
            toast.success("เปิดวันสำเร็จ");
            fetchDisabledDates();
        }
    };

    const deleteHoliday = async (id: number) => {
        const res = await fetch(`/api/system/holidays/${id}`, { method: "DELETE" });
        if (res.ok) {
            toast.success("ลบวันหยุดแล้ว");
            fetchHolidays();
        }
    };

    const saveHoliday = async () => {
        if (!editing) return;

        if (!editing.date || !editing.name) {
            return toast.error("กรุณากรอกข้อมูลให้ครบ");
        }

        const isDuplicate = holidays.some(
            (h) => h.date === editing.date && h.id !== editing.id
        );

        if (isDuplicate) {
            return toast.error("วันที่นี้มีวันหยุดอยู่แล้ว");
        }

        const isCreate = editing.id === 0;

        const res = await fetch(
            isCreate
                ? "/api/system/holidays"
                : `/api/system/holidays/${editing.id}`,
            {
                method: isCreate ? "POST" : "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editing),
            }
        );

        if (res.status === 409) {
            return toast.error("วันที่นี้มีวันหยุดอยู่แล้ว");
        }

        if (res.ok) {
            toast.success(isCreate ? "เพิ่มวันหยุดแล้ว" : "แก้ไขวันหยุดแล้ว");
            setEditing(null);
            fetchHolidays();
        }
    };

    /* ================= render ================= */
    return (
        <>
            <div>
                {/* Header คงเดิมตามคำขอ */}
                <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm shadow-md">
                    <h1 className="text-xl font-bold whitespace-nowrap">ตั้งค่าวันปิดให้บริการ</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8 pb-12 mt-8">
                {/* ปิดวันเดียว */}
                <Card title="ปิดวันเดียว">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                        <DatePicker
                            locale="th"
                            selected={singleDay}
                            onChange={(d) => setSingleDay(d)}
                            dateFormat="dd MMMM yyyy"
                            placeholderText="เลือกวันที่"
                            className="border px-3 py-2 rounded-lg w-full h-11"
                        />
                        <button
                            onClick={closeSingleDay}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-11"
                        >
                            ปิดวันนี้
                        </button>
                    </div>
                </Card>

                {/* ปิดช่วงวัน */}
                <Card title="ปิดหลายวัน (ช่วงวันที่)">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                        <DatePicker
                            locale="th"
                            selected={start}
                            onChange={(d) => setStart(d)}
                            placeholderText="เริ่ม"
                            className="border px-3 py-2 rounded-lg w-full h-11"
                        />
                        <DatePicker
                            locale="th"
                            selected={end}
                            onChange={(d) => setEnd(d)}
                            placeholderText="สิ้นสุด"
                            className="border px-3 py-2 rounded-lg w-full h-11"
                        />
                        <button
                            onClick={closeRange}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg h-11"
                        >
                            ปิดช่วงวัน
                        </button>
                    </div>
                </Card>

                {/* disabled dates */}
                <Card title="วันที่ถูกปิดทั้งหมด">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {disabledDates.map((d) => (
                            <div
                                key={d.id}
                                className="flex justify-between p-3 border rounded-xl bg-gray-50"
                            >
                                <span>{formatThaiDate(d.date)}</span>
                                <button
                                    onClick={() => openDay(d.date)}
                                    className="text-blue-600 underline"
                                >
                                    เปิดกลับ
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* holidays */}
                <Card
                    title={
                        <div className="flex justify-between items-center">
                            <span>วันหยุด (Holiday)</span>
                            <button
                                onClick={() => setEditing(EMPTY_HOLIDAY)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                                + เพิ่มวันหยุด
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        {paginatedHolidays.map((h) => (
                            <div
                                key={h.id}
                                className="flex justify-between p-3 border rounded-xl bg-gray-50"
                            >
                                <div>
                                    <p className="font-medium">{formatThaiDate(h.date)}</p>
                                    <p className="text-sm text-gray-600">
                                        {h.name} • {HOLIDAY_TYPE_MAP[h.type]}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditing(h)}
                                        className="text-yellow-600 underline"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => deleteHoliday(h.id)}
                                        className="text-red-600 underline"
                                    >
                                        ลบ
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onChange={setPage}
                    />
                </Card>
            </div>

            {/* modal create / edit */}
            {editing && (
                <div className="
    fixed inset-0
    bg-black/40
    z-[9999]
    overflow-y-auto
    flex items-center justify-center
    px-4
    py-10
    pb-[env(safe-area-inset-bottom)]
  ">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md space-y-4 my-auto">
                        <h3 className="text-lg font-semibold">
                            {editing.id === 0 ? "เพิ่มวันหยุด" : "แก้ไขวันหยุด"}
                        </h3>

                        <DatePicker
                            locale="th"
                            selected={editing.date ? new Date(editing.date + "T00:00:00") : null}
                            onChange={(d) =>
                                setEditing({
                                    ...editing,
                                    date: d ? toLocalDateString(d) : editing.date,
                                })
                            }
                            dateFormat="dd MMMM yyyy"
                            className="border p-2 rounded-lg w-full h-11"
                            wrapperClassName="w-full"
                        />

                        <input
                            className="border p-2 rounded-lg w-full"
                            placeholder="ชื่อวันหยุด"
                            value={editing.name}
                            onChange={(e) =>
                                setEditing({ ...editing, name: e.target.value })
                            }
                        />

                        <select
                            className="border p-2 rounded-lg w-full"
                            value={editing.type}
                            onChange={(e) =>
                                setEditing({ ...editing, type: e.target.value })
                            }
                        >
                            <option value="NATIONAL">วันหยุดราชการ</option>
                            <option value="SPECIAL">วันหยุดพิเศษ</option>
                            <option value="RELIGIOUS">วันทางศาสนา</option>
                            <option value="OTHER">อื่น ๆ</option>
                        </select>

                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditing(null)}>ยกเลิก</button>
                            <button
                                onClick={saveHoliday}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                            >
                                {editing.id === 0 ? "สร้าง" : "บันทึก"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
