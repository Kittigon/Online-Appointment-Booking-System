'use client';
import { useState, useEffect } from "react";
import { Clock } from 'lucide-react'

const time = ["10:00", "11:00", "13:00", "14:00"];

const getDaysInMonth = (offset: number): string[] => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();

    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: string[] = [];

    for (let i = 1; i <= totalDays; i++) {
        const day = new Date(year, month, i);

        // ---- START: เพิ่มส่วนนี้เข้ามา ----
        const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue; // ข้ามไปวันถัดไปถ้าเป็นเสาร์หรืออาทิตย์
        }
        // ---- END: เพิ่มส่วนนี้เข้ามา ----

        // FIX: จัดการรูปแบบวันที่เพื่อหลีกเลี่ยงปัญหา Timezone
        const yyyy = day.getFullYear();
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        const dd = String(day.getDate()).padStart(2, '0');

        days.push(`${yyyy}-${mm}-${dd}`);
    }

    return days;
};


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

    useEffect(() => {
        FecthUser();
    }, []);

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

    useEffect(() => {
        if (data?.id) {
            FetchAppointment();
        }
    }, [data, date]);

    const FetchAppointment = async () => {
        try {
            const res = await fetch('/api/appointment');
            const data = await res.json();

            const updatedStatus: typeof status = { ...status };

            data.showAppoinment.forEach((appoint: any) => {
                if (updatedStatus[appoint.date] && updatedStatus[appoint.date][appoint.time] === null) {
                    updatedStatus[appoint.date][appoint.time] = {
                        name: appoint.name,
                        code: appoint.code,
                        phone: appoint.phone,
                        description: appoint.description,
                    };
                }
            });

            setStatus(updatedStatus);
        } catch (error) {
            console.error("โหลดข้อมูลล้มเหลว:", error);
        }
    };

    const FecthUser = async () => {
        try {
            const res = await fetch('/api/token', {
                method: 'GET',
                credentials: "include",
            });

            const data = await res.json();
            if (res.ok) {
                setData(data.user);
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        }
    };

    const handleSelect = (date: string, time: string) => {
        const booking = status[date]?.[time];

        if (booking) {
            setSelectedBookedInfo({ ...booking, date, time });
            return;
        }

        const now = new Date();
        const [h, m] = time.split(":").map(Number);
        const selected = new Date(date);
        selected.setHours(h, m, 0, 0);

        const dayOfWeek = selected.getDay(); // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            alert("ไม่สามารถเลือกวันเสาร์-อาทิตย์ได้");
            return;
        }

        if (selected.getTime() - now.getTime() < 2 * 60 * 60 * 1000) {
            alert("กรุณาเลือกเวลาล่วงหน้าอย่างน้อย 2 ชั่วโมง");
            return;
        }

        setSelectedDate(date);
        setSelectedTime(time);
    };

    const handleSave = async () => {
        try {
            if (!selectedDate || !selectedTime) return alert("กรุณาเลือกวันและเวลา");
            if (!name.trim()) return alert("กรุณากรอกชื่อ");
            if (!code.trim() || !phone.trim()) return alert("กรุณากรอกรหัสและเบอร์โทรศัพท์");

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

            const res = await fetch(`/api/appointment`, {
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
                alert(`จองสำเร็จ: ${formatThaiDate(selectedDate)} เวลา ${selectedTime} โดย ${name}`);
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
            }
        }
    };

    const thaiMonthYear = date.length ? formatThaiMonthYear(date[1]) : '';

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

                <div className="overflow-x-auto">
                    <table className="min-w-[700px] w-full text-center mb-6 border-separate border-spacing-2">
                        <thead>
                            <tr>
                                <th className="p-3 bg-purple-100 rounded-md">เวลา</th>
                                {date.map(date => (
                                    <th key={date} className="p-3 bg-purple-100 rounded-md whitespace-nowrap">
                                        {formatThaiDate(date)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {time.map(time => (
                                <tr key={time}>
                                    <td className="p-3 font-semibold bg-white rounded-md shadow">{time}</td>
                                    {date.map(date => {
                                        const booking = status[date]?.[time];
                                        const isSelected = selectedDate === date && selectedTime === time;

                                        return (
                                            <td
                                                key={date + time}
                                                className={`
                                                    p-2 rounded-md text-sm font-medium whitespace-nowrap
                                                    ${booking ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer'}
                                                    ${isSelected ? 'ring-2 ring-yellow-500' : ''}
                                                `}
                                                onClick={() => handleSelect(date, time)}
                                            >
                                                {booking ? "ไม่ว่าง" : "ว่าง"}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* แสดงรายการนัดหมายของวันนี้ */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">การนัดหมายของวันนี้</h2>

                    {(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const todayAppointments = status[todayStr] || {};

                        const bookedTimes = Object.entries(todayAppointments).filter(([_, info]) => info !== null);

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
                </div>


                {/* ฟอร์มจอง */}
                {selectedDate && selectedTime && status[selectedDate]?.[selectedTime] === null && (
                    <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">กรอกชื่อผู้รับการปรึกษา</h2>
                        <input
                            type="text"
                            value={`${formatThaiDate(selectedDate)} | เวลา : ${selectedTime}`}
                            readOnly
                            className="w-full p-3 border font-bold border-gray-200 bg-gray-100 text-gray-600 rounded-md mb-4"
                        />
                        <input
                            type="text"
                            placeholder="ชื่อ-นามสกุล"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md mb-4"
                        />
                        <input
                            type="text"
                            placeholder="รหัสประจำตัว"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md mb-4"
                        />
                        <input
                            type="text"
                            placeholder="เบอร์โทรศัพท์"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md mb-4"
                        />
                        <textarea
                            placeholder="ช่องทางการติดต่อเพิ่มเติม"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            className="p-3 border border-gray-300 rounded-md w-full mb-4"
                        />
                        <div className="flex flex-col md:flex-row justify-end gap-4">
                            <button
                                onClick={handleSave}
                                className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-full"
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
                                className="w-full md:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-6 rounded-full"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                )}

                {/* ข้อมูลผู้จอง */}
                {selectedBookedInfo && (
                    <div className="bg-white shadow-md rounded-lg p-6 mt-6 border border-purple-200">
                        <h3 className="text-xl font-bold text-black mb-4 border-b pb-2">ข้อมูลผู้จอง</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 text-[15px]">
                            <input
                                type="text"
                                value={`${formatThaiDate(selectedBookedInfo.date)} | เวลา: ${selectedBookedInfo.time}`}
                                readOnly
                                className="w-full p-3 border font-bold border-gray-200 bg-gray-100 text-gray-600 rounded-md mb-2"
                            />
                            <input
                                type="text"
                                value={`ชื่อ: ${selectedBookedInfo.name}`}
                                readOnly
                                className="w-full p-3 border border-gray-200 bg-gray-100 text-gray-600 rounded-md mb-4"
                            />
                            <input
                                type="text"
                                value={`รหัส: ${selectedBookedInfo.code}`}
                                readOnly
                                className="w-full p-3 border border-gray-200 bg-gray-100 text-gray-600 rounded-md mb-4"
                            />
                            <input
                                type="text"
                                value={`เบอร์โทรศัพท์: ${selectedBookedInfo.phone}`}
                                readOnly
                                className="w-full p-3 border border-gray-200 bg-gray-100 text-gray-600 rounded-md mb-4"
                            />
                            <textarea
                                value={`ช่องทางการติดต่อเพิ่มเติม : ${selectedBookedInfo.description}`}
                                rows={3}
                                readOnly
                                className="p-3 border border-gray-200 bg-gray-100 text-gray-600 rounded-md col-span-1 md:col-span-2 w-full mb-4"
                            />
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setSelectedBookedInfo(null)}
                                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-full text-sm font-medium text-gray-800"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default MentalhealthAppointment;
