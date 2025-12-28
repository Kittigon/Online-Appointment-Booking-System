"use client";

import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle, XCircle, Hourglass } from "lucide-react";

import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
    });
};

const formatLocalDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

type Appointment = {
    id: number;
    name: string;
    code: string;
    phone: string;
    description: string;
    date: string;
    time: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    reason?: string;
};

const colorByStatus: Record<string, string> = {
    PENDING: "bg-orange-50 border-orange-200 text-orange-900",
    CONFIRMED: "bg-green-50 border-green-200 text-green-900",
    CANCELLED: "bg-red-50 border-red-200 text-red-900",
};


export default function MentalhealthList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [selected, setSelected] = useState<Appointment | null>(null);
    const [reason, setReason] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await fetch("/api/appointments");
            const data = await res.json();
            setAppointments(Array.isArray(data.showAppoinment) ? data.showAppoinment : []);

        } catch (err) {
            console.error("Fetch failed:", err);
        }
    };

    const monthlyAppointments = appointments.filter((a) => {
        if (!a.date) return false;

        const filterKey = `${selectedDate.getFullYear()}-${String(
            selectedDate.getMonth() + 1
        ).padStart(2, "0")}`;

        const inSameMonth = a.date.startsWith(filterKey);

        if (selectedDay) {
            const selectedDayStr = formatLocalDate(selectedDay);
            return a.date === selectedDayStr;
        }

        return inSameMonth;
    });

    const updateStatus = async (newStatus: string) => {
        if (!selected) return;
        if (newStatus === "CANCELLED" && !reason.trim()) {
            alert("กรุณาระบุเหตุผลการยกเลิก");
            return;
        }
        try {
            const res = await fetch(`/api/appointments/${selected.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus, reason }),
            });
            if (res.ok) {
                setSelected(null);
                setReason("");
                fetchAppointments();
            } else {
                alert("อัปเดตสถานะไม่สำเร็จ (Mock Mode: Success)");
                // Mock Success for UI testing
                setSelected(null);
                setReason("");
            }
        } catch {
            alert("เกิดข้อผิดพลาด");
        }
    };

    const StatusIcon = (status: Appointment["status"]) => {
        switch (status) {
            case "CONFIRMED": return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "PENDING": return <Hourglass className="w-5 h-5 text-orange-600" />;
            case "CANCELLED": return <XCircle className="w-5 h-5 text-red-600" />;
        }
    };


    return (
        <>
            <div>
                {/* Header คงเดิมตามคำขอ */}
                <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm shadow-md">
                    <h1 className="text-xl font-bold whitespace-nowrap">การนัดหมายจากผู้ใช้บริการ</h1>
                </div>
            </div>

            <div className="p-4 sm:p-6 min-h-screen">
                {/* ส่วนเลือกเดือน: ปรับเป็น Flex-col บนมือถือ และ Flex-row บนจอใหญ่ */}

                {/* เลือกวัน */}
                <header className="mb-6 flex flex-col sm:flex-row sm:items-center  gap-4 sm:gap-6">
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border w-full sm:w-fit">
                        <label className="font-semibold mb-2 sm:mb-0 sm:mr-3 text-gray-700">เลือกวัน:</label>
                        <DatePicker
                            selected={selectedDay}
                            onChange={(date) => setSelectedDay(date)}
                            locale="th"
                            dateFormat="dd MMMM yyyy"
                            placeholderText="เลือกวันที่ต้องการ"
                            className="w-full sm:w-auto border px-4 py-2 rounded-lg cursor-pointer text-purple-700 font-medium hover:bg-gray-50 focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border w-full sm:w-fit">
                        <label className="font-semibold mb-2 sm:mb-0 sm:mr-3 text-gray-700">เลือกเดือน:</label>
                        <div className="relative w-full sm:w-auto">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                locale="th"
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="w-full sm:w-auto border px-4 py-2 rounded-lg cursor-pointer text-purple-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                </header>

                {/* รายการนัดหมาย */}
                <div className="space-y-4">
                    {monthlyAppointments.length === 0 && (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่มีนัดหมายในเดือนนี้</p>
                        </div>
                    )}

                    {monthlyAppointments.map((a) => (
                        <div
                            key={a.id}
                            onClick={() => setSelected(a)}
                            className={`p-4 bg-white shadow-md rounded-xl border-l-4 cursor-pointer transition-transform hover:scale-[1.01] active:scale-95 ${colorByStatus[a.status]}`}
                        >
                            {/* Card Layout: Flex-col (มือถือ) -> Flex-row (จอใหญ่) */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                {/* Left Side: Info */}
                                <div className="w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-bold text-lg sm:text-xl">{a.name}</p>
                                        {/* แสดง Status icon เล็กๆ ตรงชื่อเฉพาะมือถือ เพื่อให้ดูง่าย */}
                                        <div className="sm:hidden">{StatusIcon(a.status)}</div>
                                    </div>

                                    <p className="text-sm text-gray-600 break-words">
                                        รหัส: {a.code} • เบอร์: <a href={`tel:${a.phone}`} className="underline decoration-dotted">{a.phone}</a>
                                    </p>

                                    <p className="text-sm mt-2 text-gray-700 italic bg-white/60 inline-block px-2 py-1 rounded border border-gray-100/50">
                                        {a.description || "ไม่มีหมายเหตุ"}
                                    </p>

                                    <div className="flex flex-wrap items-center mt-3 text-gray-800 font-medium text-sm sm:text-base">
                                        <Clock className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                                        <span>{formatThaiDate(a.date)}</span>
                                        <span className="mx-2 hidden sm:inline">|</span>
                                        <span className="block w-full sm:w-auto mt-1 sm:mt-0 sm:ml-0 text-purple-700 bg-purple-50 px-2 rounded-md">
                                            เวลา {a.time} น.
                                        </span>
                                    </div>
                                </div>

                                {/* Right Side: Status */}
                                {/* มือถือ: เป็นแถบแนวนอนมีเส้นคั่น / จอใหญ่: เป็นกล่องแนวตั้งขวาสุด */}
                                <div className="w-full sm:w-auto sm:min-w-[120px] flex sm:flex-col flex-row items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-gray-200/50">
                                    <div className="flex items-center gap-2">
                                        {/* Icon ซ่อนในมือถือเพราะไปโชว์ตรงชื่อแล้ว หรือจะโชว์ซ้ำก็ได้ */}
                                        <div className="hidden sm:block">{StatusIcon(a.status)}</div>
                                        <span className={`text-sm font-bold ${a.status === 'CONFIRMED' ? 'text-green-700' :
                                            a.status === 'CANCELLED' ? 'text-red-700' : 'text-orange-700'
                                            }`}>
                                            {a.status}
                                        </span>
                                    </div>

                                    {a.status === "CANCELLED" && a.reason && (
                                        <p className="text-xs text-red-600 mt-0 sm:mt-1 text-right max-w-[150px] truncate sm:whitespace-normal">
                                            {a.reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal */}
                {selected && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4">
                        {/* Modal Content: เต็มจอแนวนอนในมือถือ, เป็น Box ในจอใหญ่ */}
                        <div className="bg-white w-full sm:w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 sm:fade-in sm:zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold mb-4 text-purple-700 border-b pb-2 flex justify-between items-center">
                                    จัดการนัดหมาย
                                    <button onClick={() => setSelected(null)} className="sm:hidden text-gray-400">
                                        <XCircle />
                                    </button>
                                </h2>

                                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                                    <p className="text-lg font-semibold text-gray-800">{selected.name}</p>
                                    <p className="text-gray-500 flex items-center mt-1 text-sm">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatThaiDate(selected.date)} เวลา {selected.time}
                                    </p>
                                </div>

                                <textarea
                                    className="w-full border-gray-300 border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                                    placeholder="ระบุเหตุผล (จำเป็นกรณี 'ยกเลิก')"
                                    rows={3}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white py-3 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={() => updateStatus("CONFIRMED")}
                                    >
                                        <CheckCircle className="w-4 h-4" /> ยืนยันนัดหมาย
                                    </button>

                                    <button
                                        className="bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={() => updateStatus("PENDING")}
                                    >
                                        <Hourglass className="w-4 h-4" /> รอดำเนินการ
                                    </button>

                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white py-3 sm:py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        onClick={() => updateStatus("CANCELLED")}
                                    >
                                        <XCircle className="w-4 h-4" /> ยกเลิกนัดหมาย
                                    </button>

                                    <button
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 sm:py-2.5 rounded-lg mt-2 transition-colors hidden sm:block"
                                        onClick={() => setSelected(null)}
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}