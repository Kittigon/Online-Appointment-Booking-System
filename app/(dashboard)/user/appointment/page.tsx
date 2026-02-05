'use client';
import { useEffect, useState, useCallback } from "react";
import { appointmentSchema } from "@/schemas/appointment";
import toast from 'react-hot-toast'
import { User } from "lucide-react";

// กำหนดเวลาในแต่ละวัน
const time = ["10:00", "11:00", "13:00", "14:00"];

// ฟังก์ชันสำหรับสร้างวันที่ถัดไป 5 วันทำการ (ข้ามเสาร์-อาทิตย์)
const getNextWeekdays = (offset: number): string[] => {
    const days: string[] = [];
    const date = new Date();
    date.setDate(date.getDate() + offset);

    while (days.length < 5) {
        const day = date.getDay();
        if (day !== 0 && day !== 6) {
            const dateStr = date.toISOString().split('T')[0];
            days.push(dateStr);
        }
        date.setDate(date.getDate() + 1);
    }
    return days;
};

// แปลง yyyy-mm-dd → "4 กรกฎาคม 2025"
const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
    });
};

// แปลง yyyy-mm-dd → "กรกฎาคม 25xx"
const formatThaiMonthYear = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        month: 'long',
        year: 'numeric',
    });
};

type Appointment = {
    title: string;
    name: string;
    code: string;
    phone: string;
    description: string;
    date: string;
    time: string;
}

type User = {
    id: number;
    email: string;
    name: string;
    code: string;
    phone: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

type DisabledDate = {
    date: string;
};

type FormErrors = {
    title?: string;
    name?: string;
    code?: string;
    phone?: string;
    description?: string;
}

type AppointmentInfo = {
    name: string;
    code: string;
    phone: string;
    description: string;
};

const UserAppointment = () => {
    const [status, setStatus] = useState<Record<string, Record<string, AppointmentInfo | null>>>({});
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [title, setTitle] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setdescription] = useState('');

    const [data, setData] = useState<User | null>(null);
    const [offset, setOffset] = useState(0);
    const [dateList, setDateList] = useState(getNextWeekdays(0));

    const [disabledDates, setDisabledDates] = useState<string[]>([]);
    const [holidayDates, setHolidayDates] = useState<string[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});

    const fetchUser = useCallback(async () => {
        const res = await fetch("/api/auth/token", { credentials: "include" });
        if (!res.ok) return;

        const token = await res.json();
        const userRes = await fetch(`/api/user/${token.user.id}`);
        const userData = await userRes.json();

        setData(userData.showuser);
    }, []);

    const FetchAppointment = useCallback(async (dates: string[]) => {
        const base: typeof status = {};
        dates.forEach(date => {
            base[date] = {};
            time.forEach(t => {
                base[date][t] = null;
            });
        });

        try {
            const res = await fetch("/api/appointments");
            const data: { showAppoinment: Appointment[] } = await res.json();

            data.showAppoinment.forEach(a => {
                if (base[a.date]?.[a.time] !== undefined) {
                    base[a.date][a.time] = {
                        name: a.name,
                        code: a.code,
                        phone: a.phone,
                        description: a.description
                    };
                }
            });
            setStatus(base);
        } catch {
            toast.error("โหลดข้อมูลการนัดหมายล้มเหลว");
        }
    }, []);

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
            const dates = Array.isArray(data) ? data.map((h: { date: string }) => h.date) : [];
            setHolidayDates(dates);
        } catch (error) {
            console.error("โหลดวันหยุดไม่สำเร็จ", error);
        }
    };

    useEffect(() => {
        if (!data) return;
        if (data.name) {
            setName(data.name);
            setErrors(prev => ({ ...prev, name: undefined }));
        }
        if (data.phone) {
            setPhone(data.phone);
            setErrors(prev => ({ ...prev, phone: undefined }));
        }
        if (data.code) {
            setCode(data.code);
            setErrors(prev => ({ ...prev, code: undefined }));
        }
    }, [data]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const newDates = getNextWeekdays(offset);
        setDateList(newDates);
        FetchAppointment(newDates);
    }, [offset, FetchAppointment]);

    useEffect(() => {
        fetchDisabledDates();
        fetchHolidays();
    }, []);

    const blockedDates = [...new Set([...disabledDates, ...holidayDates])];

    const getBlockedType = (date: string) => {
        if (holidayDates.includes(date)) return "HOLIDAY";
        if (disabledDates.includes(date)) return "DISABLED";
        return null;
    };

    const handleSelect = (date: string, time: string) => {
        if (status[date]?.[time]) return;
        if (blockedDates.includes(date)) {
            toast.error("วันนี้เป็นวันหยุดหรือถูกปิด ไม่สามารถจองได้");
            return;
        }

        const checkDay = new Date(date).getDay();
        if (checkDay === 0 || checkDay === 6) {
            toast.error("ไม่สามารถจองวันเสาร์-อาทิตย์ได้");
            return;
        }

        const now = new Date();
        const [hour, minute] = time.split(":").map(Number);
        const selected = new Date(date);
        selected.setHours(hour, minute, 0, 0);

        const minDiffMs = 2 * 60 * 60 * 1000;
        if (selected.getTime() - now.getTime() < minDiffMs) {
            toast.error("กรุณาเลือกเวลาล่วงหน้าอย่างน้อย 2 ชั่วโมง");
            return;
        }

        setSelectedDate(date);
        setSelectedTime(time);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const validateData = appointmentSchema.safeParse({
                title, name, code, phone, description,
                date: selectedDate,
                time: selectedTime
            });

            if (!validateData.success) {
                const newErrors: FormErrors = {};
                validateData.error.issues.forEach(issue => {
                    const field = issue.path[0] as keyof FormErrors;
                    newErrors[field] = issue.message;
                });
                setErrors(newErrors);
                toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
                return;
            }

            const userId = data?.id;
            const payload = { userId, title, name, code, phone, description, date: selectedDate, time: selectedTime };

            const res = await fetch('/api/appointments', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                toast.error(errData.message);
                return;
            }

            setStatus(prev => ({
                ...prev,
                [selectedDate]: {
                    ...prev[selectedDate],
                    [selectedTime]: { name, code, phone, description }
                }
            }));

            toast.success(`จองสำเร็จ: ${selectedDate} เวลา ${selectedTime}`);
            setIsModalOpen(false);
            resetForm();

        } catch (error: unknown) {
            console.error("Create Appointment Failed:", error);
        }
    };

    const thaiMonthYear = dateList.length ? formatThaiMonthYear(dateList[0]) : '';

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof FormErrors, value: string) => {
        setter(value);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }

    const resetForm = () => {
        setSelectedDate("");
        setSelectedTime("");
        setName(data?.name ?? "");
        setCode(data?.code ?? "");
        setPhone(data?.phone ?? "");
        setTitle("");
        setdescription("");
        setErrors({});
    };

    return (
        <>
            <div className="bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold">ตารางนัดหมาย</h1>
            </div>

            <div className="p-4 md:p-6 mx-auto max-w-7xl">
                <div className="flex md:flex-row justify-between items-end md:items-center mb-6 gap-4 px-2">
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{thaiMonthYear}</h2>
                        <p className="text-sm text-gray-500 font-light">เลือกวันและเวลาที่คุณสะดวก</p>
                    </div>

                    <div className="flex items-center bg-white p-1 rounded-full shadow-sm border border-gray-200">
                        <button
                            onClick={() => setOffset(prev => Math.max(prev - 7, 0))}
                            disabled={offset === 0}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${offset === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600 active:scale-95'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
                        <button
                            onClick={() => { if (offset + 7 < 365) setOffset(prev => prev + 7) }}
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 text-gray-600 hover:bg-purple-50 hover:text-purple-600 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-between mt-6 mb-8 gap-4 w-full">
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-md border border-purple-200 bg-white shadow-sm"></div>
                            <span className="text-sm text-gray-600 font-medium">ว่าง</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-purple-700">ที่เลือก</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-md bg-gray-100"></div>
                            <span className="text-sm text-gray-400">ถูกจองแล้ว</span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-6 h-6 rounded-md bg-red-50 border border-red-100 flex items-center justify-center">
                                <span className="text-red-300 text-xs">✕</span>
                            </div>
                            <span className="text-sm text-red-400">งดให้บริการ</span>
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full border border-orange-100 shadow-sm">
                        <span className="text-xs font-semibold">กรุณานัดหมายล่วงหน้าอย่างน้อย 2 ชั่วโมง</span>
                    </div>
                </div>

                {/* ================= MOBILE VIEW ================= */}
                <div className="block md:hidden space-y-4">
                    {dateList.map(date => {
                        const blockedType = getBlockedType(date); // "HOLIDAY" | "DISABLED" | null
                        const isBlocked = !!blockedType;

                        return (
                            <div
                                key={date}
                                className={`
                    rounded-2xl border p-4 shadow-sm
                    ${blockedType === "HOLIDAY"
                                        ? "bg-orange-50 border-orange-200"
                                        : blockedType === "DISABLED"
                                            ? "bg-red-50 border-red-200"
                                            : "bg-white border-gray-100"}
                `}
                            >
                                {/* ===== Header วันที่ ===== */}
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`
                                w-10 h-10 flex items-center justify-center rounded-xl font-bold text-lg shadow-sm
                                ${blockedType
                                                    ? "bg-white text-red-500"
                                                    : "bg-purple-100 text-purple-700"}
                            `}
                                        >
                                            {new Date(date).getDate()}
                                        </div>

                                        <div className="flex flex-col">
                                            <span className={`text-sm font-bold ${blockedType ? "text-red-500" : "text-gray-800"}`}>
                                                {new Date(date).toLocaleDateString("th-TH", { weekday: "long" })}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(date).toLocaleDateString("th-TH", { month: "long", year: "numeric" })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* ===== Badge ===== */}
                                    {blockedType === "HOLIDAY" && (
                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-md font-medium">
                                            วันหยุดนักขัตฤกษ์
                                        </span>
                                    )}

                                    {blockedType === "DISABLED" && (
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-medium">
                                            งดให้บริการ
                                        </span>
                                    )}
                                </div>

                                {/* ===== Grid เวลา ===== */}
                                {!isBlocked && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {time.map(t => {
                                            const booking = status[date]?.[t];
                                            const isSelected = selectedDate === date && selectedTime === t;

                                            return (
                                                <button
                                                    key={`${date}-${t}`}
                                                    disabled={!!booking}
                                                    onClick={() => handleSelect(date, t)}
                                                    className={`
                                        py-2 px-3 rounded-lg text-sm font-medium border transition-all relative
                                        ${isSelected
                                                            ? "bg-purple-600 border-purple-600 text-white shadow-md"
                                                            : !booking
                                                                ? "bg-white border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600"
                                                                : "bg-gray-100 border-transparent text-gray-300 cursor-not-allowed"}
                                    `}
                                                >
                                                    {t} น.
                                                    {isSelected && (
                                                        <span className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ================= DESKTOP VIEW ================= */}
                <div className="hidden md:block overflow-hidden bg-white shadow-lg rounded-2xl border border-gray-100">
                    <div className="overflow-x-auto pb-2">
                        <table className="min-w-full text-center border-separate border-spacing-3">
                            <thead>
                                <tr>
                                    <th className="p-4 bg-white text-gray-400 text-sm sticky left-0 z-10">
                                        เวลา / วันที่
                                    </th>

                                    {dateList.map(date => {
                                        const blockedType = getBlockedType(date);

                                        return (
                                            <th key={date} className="p-4 min-w-[140px]">
                                                <div
                                                    className={`
                                        flex flex-col items-center justify-center rounded-xl py-2
                                        ${blockedType === "HOLIDAY"
                                                            ? "bg-orange-50"
                                                            : blockedType === "DISABLED"
                                                                ? "bg-red-50"
                                                                : "bg-purple-50"}
                                    `}
                                                >
                                                    <span className={`text-xs font-bold
                                        ${blockedType ? "text-red-500" : "text-purple-400"}`}
                                                    >
                                                        {new Date(date).toLocaleDateString("th-TH", { weekday: "short" })}
                                                    </span>

                                                    <span className={`text-lg font-bold
                                        ${blockedType ? "text-red-600" : "text-gray-700"}`}
                                                    >
                                                        {new Date(date).getDate()}{" "}
                                                        {new Date(date).toLocaleDateString("th-TH", { month: "short" })}
                                                    </span>

                                                    {blockedType === "HOLIDAY" && (
                                                        <span className="text-[10px] text-orange-600 mt-1">
                                                            วันหยุด
                                                        </span>
                                                    )}

                                                    {blockedType === "DISABLED" && (
                                                        <span className="text-[10px] text-red-600 mt-1">
                                                            งดบริการ
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                {time.map(t => (
                                    <tr key={t}>
                                        <td className="sticky left-0 bg-white z-10 p-2">
                                            <div className="bg-gray-50 rounded-lg py-2 px-4 text-sm font-semibold">
                                                {t} น.
                                            </div>
                                        </td>

                                        {dateList.map(date => {
                                            const blockedType = getBlockedType(date);
                                            const booking = status[date]?.[t];
                                            const isSelected = selectedDate === date && selectedTime === t;

                                            if (blockedType) {
                                                return (
                                                    <td key={date + t}>
                                                        <div
                                                            className={`
                                                h-12 rounded-lg border flex items-center justify-center text-xs font-medium
                                                ${blockedType === "HOLIDAY"
                                                                    ? "bg-orange-50 text-orange-600 border-orange-200"
                                                                    : "bg-red-50 text-red-600 border-red-200"}
                                            `}
                                                        >
                                                            {blockedType === "HOLIDAY" ? "วันหยุด" : "งดบริการ"}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={date + t}>
                                                    <button
                                                        disabled={!!booking}
                                                        onClick={() => handleSelect(date, t)}
                                                        className={`
                                            w-full h-12 rounded-xl border text-sm font-medium transition-all
                                            ${isSelected
                                                                ? "bg-purple-600 border-purple-600 text-white shadow-md scale-105"
                                                                : !booking
                                                                    ? "bg-white border-purple-100 text-purple-600 hover:bg-purple-50"
                                                                    : "bg-gray-100 border-transparent text-gray-400 cursor-not-allowed"}
                                        `}
                                                    >
                                                        {isSelected ? "เลือกแล้ว" : booking ? "ถูกจองแล้ว" : "ว่าง"}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal Form */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setIsModalOpen(false)} />
                        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">ข้อมูลผู้ขอรับบริการ</h2>
                                <button onClick={() => { resetForm(); setIsModalOpen(false); }} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <span className="text-red-500 block mb-3 text-sm">*** สถานที่นัดหมาย : อาคารสงวนเสริมศรี ***</span>
                            <input
                                type="text"
                                value={`${formatThaiDate(selectedDate)} | เวลา: ${selectedTime}`}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 mb-4"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="col-span-full">
                                    <label className="text-sm font-medium">หัวเรื่องการนัดหมาย</label>
                                    <select
                                        value={title}
                                        onChange={(e) => handleChange(setTitle, "title", e.target.value)}
                                        className={`w-full mt-1 p-2 border rounded-xl ${errors.title ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                                    >
                                        <option value="">-- ไม่ระบุหัวเรื่อง --</option>
                                        <option value="ปรึกษาทั่วไป">ปรึกษาทั่วไป</option>
                                        <option value="ความเครียด">ความเครียด</option>
                                        <option value="ความวิตกกังวล">ความวิตกกังวล</option>
                                        <option value="ภาวะซึมเศร้า">ภาวะซึมเศร้า</option>
                                        <option value="ปัญหาครอบครัว">ปัญหาครอบครัว</option>
                                    </select>
                                    {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
                                </div>
                                <div>
                                    <input type="text" placeholder="ชื่อ-นามสกุล" value={name} onChange={e => handleChange(setName, 'name', e.target.value)} className={`w-full p-3 border rounded-md ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                                </div>
                                <div>
                                    <input type="text" placeholder="รหัสนักศึกษา/พนักงาน" value={code} onChange={e => handleChange(setCode, 'code', e.target.value)} className={`w-full p-3 border rounded-md ${errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.code && <span className="text-red-500 text-xs">{errors.code}</span>}
                                </div>
                                <div>
                                    <input type="number" placeholder="เบอร์โทรศัพท์" value={phone} onChange={e => handleChange(setPhone, 'phone', e.target.value)} className={`w-full p-3 border rounded-md ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
                                    {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
                                </div>
                                <div className="col-span-full">
                                    <textarea placeholder="หมายเหตุ (ถ้ามี)" value={description} onChange={e => setdescription(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row justify-end gap-4">
                                <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-full font-medium">ยืนยันการนัดหมาย</button>
                                <button onClick={() => { resetForm(); setIsModalOpen(false); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-full font-medium">ยกเลิก</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default UserAppointment;