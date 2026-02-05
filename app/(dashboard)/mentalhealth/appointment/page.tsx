'use client';
import { useState, useEffect, useCallback } from "react";
import { appointmentSchema } from "@/schemas/appointment";
import { toast } from "react-hot-toast";
// import { Clock } from 'lucide-react'

const time = ["10:00", "11:00", "13:00", "14:00"];
// ลบ Logic ที่ข้ามเสาร์อาทิตย์ออก เพื่อให้ Grid เรียงตัวสวยงามครบ 7 ช่อง
const getDaysInMonth = (offset: number): string[] => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: string[] = [];

    for (let i = 1; i <= totalDays; i++) {
        const day = new Date(year, month, i);
        // --- ลบส่วนที่ continue เสาร์อาทิตย์ออก ---

        const yyyy = day.getFullYear();
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        const dd = String(day.getDate()).padStart(2, '0');
        days.push(`${yyyy}-${mm}-${dd}`);
    }
    return days;
};

type Appoinment = {
    id: number;
    userId: number;
    name: string;
    code: string;
    phone: string;
    description: string;
    date: string;
    time: string;
}

type AppointmentInfo = null | {
    name: string;
    code: string;
    phone: string;
    description: string;
};

type User = {
    id: number;
    email: string;
    name: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
};

type DisabledDate = {
    date: string;
};

type FormErrors = {
    name?: string;
    code?: string;
    phone?: string;
    description?: string;
}

const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: '2-digit',
        weekday: 'long'
    });
};

const formatThaiMonthYear = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        month: 'long',
        year: '2-digit',
    });
};

const MentalhealthAppointment = () => {
    const [monthOffset, setMonthOffset] = useState(0);
    const [date, setDate] = useState<string[]>(getDaysInMonth(0));
    const [status, setStatus] = useState<Record<string, Record<string, AppointmentInfo>>>({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [code, setCode] = useState('');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedBookedInfo, setSelectedBookedInfo] = useState<{
        name: string;
        code: string;
        phone: string;
        date: string;
        time: string;
        description: string;
    } | null>(null);
    const [data, setData] = useState<User | null>(null);
    // วันปิด
    const [disabledDates, setDisabledDates] = useState<string[]>([]);
    const [holidayDates, setHolidayDates] = useState<string[]>([]);

    const [errors, setErrors] = useState<FormErrors>({});

    const getDayType = (dateStr: string) => {
        const day = new Date(dateStr).getDay();
        if (holidayDates.includes(dateStr)) return "HOLIDAY";
        if (disabledDates.includes(dateStr)) return "DISABLED";
        if (day === 0 || day === 6) return "WEEKEND";
        return "NORMAL";
    };

    // ดึงข้อมูลผู้ใช้
    useEffect(() => {
        FecthUser();
    }, []);

    // อัพเดทวันที่เมื่อเปลี่ยนเดือน
    useEffect(() => {
        const newDate = getDaysInMonth(monthOffset);
        setDate(newDate);

        const newStatus: Record<string, Record<string, AppointmentInfo>> = {};
        newDate.forEach(d => {
            newStatus[d] = {};
            time.forEach(t => {
                newStatus[d][t] = null;
            });
        });

        setStatus(prev => ({ ...newStatus, ...prev }));
    }, [monthOffset]);

    const FetchAppointment = useCallback(async () => {
        try {
            const res = await fetch('/api/appointments');
            const data = await res.json();

            const newStatus: Record<string, Record<string, AppointmentInfo>> = {};

            date.forEach(d => {
                newStatus[d] = {};
                time.forEach(t => {
                    newStatus[d][t] = null;
                });
            });

            data.showAppoinment.forEach((appoint: Appoinment) => {
                if (newStatus[appoint.date]) {
                    newStatus[appoint.date][appoint.time] = {
                        name: appoint.name,
                        code: appoint.code,
                        phone: appoint.phone,
                        description: appoint.description,
                    };
                }
            });

            setStatus(newStatus);
        } catch (error) {
            console.error("โหลดข้อมูลล้มเหลว:", error);
            toast.error("โหลดข้อมูลล้มเหลว");
        }
    }, [date]);

    // ดึงข้อมูลการนัดหมาย
    useEffect(() => {
        if (data?.id) {
            FetchAppointment();
        }
    }, [data?.id, FetchAppointment]);

    // ดึงวันปิด
    useEffect(() => {
        fetchDisabledDates();
        fetchHolidays();
    }, []);


    const FecthUser = async () => {
        try {
            const res = await fetch('/api/auth/token', {
                method: 'GET',
                credentials: "include",
            });

            const data = await res.json();
            if (res.ok) {
                setData(data.user);
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
            toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
        }
    };

    const fetchDisabledDates = async () => {
        const res = await fetch('/api/appointments/disabled-date');
        const data = await res.json();

        const arr = data.disabled.map((d: DisabledDate) => d.date);
        setDisabledDates(arr);
    };

    const fetchHolidays = async () => {
        try {
            const res = await fetch("/api/system/holidays");
            const data = await res.json();

            const dates = Array.isArray(data)
                ? data.map((h: { date: string }) => h.date)
                : [];

            setHolidayDates(dates);
        } catch (err) {
            console.error("โหลดวันหยุดไม่สำเร็จ", err);
        }
    };


    // จัดการการเลือกวันและเวลา
    const handleSelect = (date: string, time: string) => {
        const type = getDayType(date);

        if (type === "HOLIDAY") {
            toast.error("วันหยุดนักขัตฤกษ์");
            return;
        }
        if (type === "DISABLED") {
            toast.error("วันนี้ปิดทำการ");
            return;
        }
        if (type === "WEEKEND") {
            toast.error("วันเสาร์–อาทิตย์");
            return;
        }

        const booking = status[date]?.[time];
        if (booking) {
            setSelectedBookedInfo({ ...booking, date, time });
            return;
        }

        setSelectedDate(date);
        setSelectedTime(time);
    };


    const handleSave = async () => {
        try {
            const validateData = appointmentSchema.safeParse({
                name,
                code,
                phone,
                description,
                date: selectedDate,
                time: selectedTime
            });

            if (!validateData.success) {
                const newErrors: FormErrors = {};
                // Map Zod issues ไปยัง errors state
                validateData.error.issues.forEach(issue => {
                    const field = issue.path[0] as keyof FormErrors;
                    newErrors[field] = issue.message;
                });
                setErrors(newErrors);
                toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
                return;
            }

            const userId = data?.id;

            const payload = {
                userId,
                name,
                code,
                phone,
                description,
                date: selectedDate,
                time: selectedTime
            };

            const res = await fetch(`/api/appointments`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setStatus(prev => ({
                    ...prev,
                    [selectedDate]: {
                        ...prev[selectedDate],
                        [selectedTime]: {
                            name,
                            code,
                            phone,
                            description
                        }
                    }
                }));

                toast.success(`จองสำเร็จ: ${formatThaiDate(selectedDate)} เวลา ${selectedTime} โดย ${name}`);
                setSelectedDate("");
                setSelectedTime("");
                setName("");
                setCode("");
                setPhone("");
                setDescription("");
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                console.log("Create Appointment Failed : ", error.message);
                toast.error("เกิดข้อผิดพลาด: " + error.message);
            }
        }
    };

    const thaiMonthYear = date.length ? formatThaiMonthYear(date[1]) : '';

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof FormErrors, value: string) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    return (
        <>
            <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ปฎิทินการนัดพบ</h1>
            </div>

            <div className="p-4 md:p-6 mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => setMonthOffset(prev => prev - 1)}
                        className="bg-purple-200 hover:bg-purple-300 px-4 py-1 rounded-md text-sm font-medium"
                    >
                        ← เดือนก่อนหน้า
                    </button>

                    <h2 className="font-semibold text-lg text-gray-700">
                        เดือน {thaiMonthYear}
                    </h2>

                    <button
                        onClick={() => setMonthOffset(prev => prev + 1)}
                        className="bg-purple-200 hover:bg-purple-300 px-4 py-1 rounded-md text-sm font-medium"
                    >
                        เดือนถัดไป →
                    </button>
                </div>

                {/* --- ส่วนปฏิทินแบบ Grid (แทนที่ Table เดิม) --- */}
                <div className="w-full max-w-[1000px] mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

                    {/* Header วันในสัปดาห์ (อาทิตย์ - เสาร์) */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((day) => (
                            <div key={day} className="py-2 text-center text-sm font-semibold text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Body ปฏิทิน */}
                    <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px border-b border-gray-200">
                        {/* Logic สร้างช่องว่าง (Empty Slots) สำหรับวันที่ 1 ที่ไม่ตรงกับวันอาทิตย์ */}
                        {(() => {
                            if (date.length === 0) return null;
                            const firstDate = new Date(date[0]);
                            const startDay = firstDate.getDay(); // 0 = Sunday, 1 = Monday, ...

                            // สร้าง array ช่องว่าง
                            return Array.from({ length: startDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="bg-gray-50 min-h-[120px]" />
                            ));
                        })()}

                        {date.map((dateStr) => {
                            const dayType = getDayType(dateStr);
                            const currentDate = new Date(dateStr);
                            const dayNum = currentDate.getDate();

                            return (
                                <div
                                    key={dateStr}
                                    className={`
                bg-white min-h-[120px] p-2 flex flex-col gap-1
                ${dayType !== "NORMAL" ? "bg-gray-50" : ""}
            `}
                                >
                                    {/* เลขวันที่ */}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`
                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${dateStr === new Date().toISOString().split("T")[0]
                                                ? "bg-purple-600 text-white"
                                                : "text-gray-700"}
                `}>
                                            {dayNum}
                                        </span>

                                        {dayType === "HOLIDAY" && (
                                            <span className="text-[10px] text-orange-500">วันหยุด</span>
                                        )}
                                        {dayType === "DISABLED" && (
                                            <span className="text-[10px] text-red-500">ปิด</span>
                                        )}
                                        {dayType === "WEEKEND" && (
                                            <span className="text-[10px] text-gray-400">หยุด</span>
                                        )}
                                    </div>

                                    {/* เวลา */}
                                    <div className="flex flex-col gap-1">
                                        {dayType === "NORMAL" && time.map(t => {
                                            const booking = status[dateStr]?.[t];
                                            const isBooked = !!booking;

                                            return (
                                                <button
                                                    key={t}
                                                    onClick={() => handleSelect(dateStr, t)}
                                                    className={`
                                text-[10px] px-2 py-1 rounded text-left
                                ${isBooked
                                                            ? "bg-gray-300 text-gray-600"
                                                            : "bg-purple-50 text-purple-700 hover:bg-purple-100"}
                            `}
                                                >
                                                    {isBooked ? "จองแล้ว" : t}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* (Optional) สร้างช่องว่างปิดท้ายเดือนให้ครบแถว ถ้าต้องการ */}
                    </div>
                </div>

                {/* แสดงรายการนัดหมายของวันนี้ */}
                {/* <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">การนัดหมายของวันนี้</h2>

                    {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const todayAppointments = status[todayStr] || {};

                        const bookedTimes = Object.entries(todayAppointments).filter(([ info ]) => info !== null);

                        if (bookedTimes.length === 0) {
                            return <p className="text-gray-500">ยังไม่มีการนัดหมายวันนี้</p>;
                        }

                        return (
                            <ul className="space-y-2 ">
                                {bookedTimes.map(([time, info]) => (
                                    <li key={time} className="bg-purple-50 p-3 rounded-md shadow text-sm text-gray-800 flex items-center gap-2">
                                        <Clock /> <strong>{time}</strong> - ชื่อ-นามสกุล : {info?.name} เบอร์โทร : ({info?.phone})
                                    </li>
                                ))}
                            </ul>
                        );
                    })()}
                </div> */}


                {/* ฟอร์มจอง */}
                {selectedDate && selectedTime && status[selectedDate]?.[selectedTime] === null && (
                    <dialog className="modal modal-open">
                        <div className="modal-box max-w-xl">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                กรอกชื่อผู้รับการปรึกษา
                            </h2>

                            <div className="flex flex-col justify-center gap-5">

                                {/* วันที่ + เวลา */}
                                <input
                                    type="text"
                                    value={`${formatThaiDate(selectedDate)} | เวลา : ${selectedTime}`}
                                    readOnly
                                    className="w-full mb-4 p-3 font-bold border border-gray-200 bg-gray-100 text-gray-600 rounded-md"
                                />

                                {/* ชื่อ-นามสกุล */}
                                <div className="flex flex-col gap-1">
                                    <input
                                        type="text"
                                        placeholder="ชื่อ-นามสกุล"
                                        value={name}
                                        onChange={(e) =>
                                            handleChange(setName, "name", e.target.value)
                                        }
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400
                ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                    />

                                    <span
                                        className={`text-sm min-h-[1.25rem] transition-opacity
                ${errors.name ? "text-red-500 opacity-100" : "opacity-0"}`}
                                    >
                                        {errors.name || "placeholder"}
                                    </span>
                                </div>

                                {/* รหัส */}
                                <div className="flex flex-col gap-1">
                                    <input
                                        type="number"
                                        placeholder="รหัส"
                                        value={code}
                                        onChange={(e) =>
                                            handleChange(setCode, "code", e.target.value)
                                        }
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400
                ${errors.code ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                    />

                                    <span
                                        className={`text-sm min-h-[1.25rem] transition-opacity
                ${errors.code ? "text-red-500 opacity-100" : "opacity-0"}`}
                                    >
                                        {errors.code || "placeholder"}
                                    </span>
                                </div>

                                {/* เบอร์โทรศัพท์ */}
                                <div className="flex flex-col gap-1">
                                    <input
                                        type="number"
                                        placeholder="เบอร์โทรศัพท์"
                                        value={phone}
                                        onChange={(e) =>
                                            handleChange(setPhone, "phone", e.target.value)
                                        }
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400
                ${errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                    />

                                    <span
                                        className={`text-sm min-h-[1.25rem] transition-opacity
                ${errors.phone ? "text-red-500 opacity-100" : "opacity-0"}`}
                                    >
                                        {errors.phone || "placeholder"}
                                    </span>
                                </div>

                                {/* หมายเหตุ */}
                                <textarea
                                    placeholder="หมายเหตุ (ถ้ามี)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-md"
                                />

                            </div>

                            {/* ปุ่มกด */}
                            <div className="modal-action flex flex-col md:flex-row justify-end gap-4 w-full">

                                <button
                                    onClick={handleSave}
                                    className="w-full md:w-auto btn bg-green-500 hover:bg-green-600 text-white border-none"
                                >
                                    บันทึก
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedDate("");
                                        setSelectedTime("");
                                        setName("");
                                        setCode("");
                                        setPhone("");
                                        setDescription("");
                                    }}
                                    className="w-full md:w-auto btn bg-gray-300 hover:bg-gray-400 text-gray-800 border-none"
                                >
                                    ยกเลิก
                                </button>
                            </div>
                        </div>

                        {/* ปิด modal เมื่อคลิกนอกกรอบ */}
                        <form method="dialog" className="modal-backdrop">
                            <button
                                onClick={() => {
                                    setSelectedDate("");
                                    setSelectedTime("");
                                    setName("");
                                    setCode("");
                                    setPhone("");
                                    setDescription("");
                                }}
                            >
                                close
                            </button>
                        </form>
                    </dialog>
                )}


                {/* ข้อมูลผู้จอง */}
                {selectedBookedInfo && (
                    <dialog className="modal modal-open">
                        <div className="modal-box max-w-xl p-0 overflow-hidden rounded-2xl shadow-xl">

                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4">
                                <h3 className="text-xl font-semibold text-white">ข้อมูลผู้จอง</h3>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 text-gray-700">

                                {/* วันที่และเวลา */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">วันที่ & เวลา</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600"></span>
                                        <span className="font-medium">
                                            {formatThaiDate(selectedBookedInfo.date)} | เวลา: {selectedBookedInfo.time}
                                        </span>
                                    </div>
                                </div>

                                {/* ชื่อ */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">ชื่อผู้จอง</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600"></span>
                                        <span>{selectedBookedInfo.name}</span>
                                    </div>
                                </div>

                                {/* รหัส */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">รหัสประจำตัว</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600"></span>
                                        <span>{selectedBookedInfo.code}</span>
                                    </div>
                                </div>

                                {/* เบอร์โทร */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">เบอร์โทรศัพท์</label>
                                    <div className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                        <span className="material-symbols-outlined text-purple-600"></span>
                                        <span>{selectedBookedInfo.phone}</span>
                                    </div>
                                </div>

                                {/* หมายเหตุ */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-600">หมายเหตุ</label>
                                    <div className="p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                        <span>{selectedBookedInfo.description || "—"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <div className="modal-action p-4 border-t bg-gray-50">
                                <button
                                    onClick={() => setSelectedBookedInfo(null)}
                                    className="btn btn-md rounded-full bg-purple-600 hover:bg-purple-700 text-white px-6"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>

                        {/* คลิกนอก modal เพื่อปิด */}
                        <form method="dialog" className="modal-backdrop">
                            <button onClick={() => setSelectedBookedInfo(null)}></button>
                        </form>
                    </dialog>
                )}

            </div>
        </>
    );
};

export default MentalhealthAppointment;
