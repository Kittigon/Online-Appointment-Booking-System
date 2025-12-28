'use client';
import { useState, useEffect } from "react";

interface UserConsent {
    name?: string;
    phone?: string;
    student_id?: string;
}

export interface Dass21Result {
    id: number;
    user_id?: string;
    depression_score?: number;
    anxiety_score?: number;
    stress_score?: number;
    depression_level?: string;
    anxiety_level?: string;
    stress_level?: string;
    created_at?: string;
    user_consent?: UserConsent;
}

// แปลงวันที่เป็นภาษาไทย
const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        weekday: 'long'
    });
};

const MentalhealthEvaluations = () => {
    const [data, setData] = useState<Dass21Result[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. เพิ่ม State สำหรับการกรอง
    const [filterHighRisk, setFilterHighRisk] = useState(false);

    useEffect(() => {
        loadData();
    }, [])

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/assessments/dass21');
            const data = await res.json();
            setData(data.dass21List);
        } catch (error) {
            console.log("โหลดข้อมูลล้มเหลว:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm(`คุณต้องการลบข้อมูล ID: ${id} ใช่หรือไม่?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/assessments/dass21/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert('ลบข้อมูลสำเร็จ');
                loadData();
            } else {
                alert('ลบข้อมูลล้มเหลว');
            }

        } catch (error) {
            console.log("ลบข้อมูลล้มเหลว:", error);
            alert('เกิดข้อผิดพลาดในการลบข้อมูล');
        }
    }

    // 2. Logic การกรองข้อมูล
    // เงื่อนไข: ถ้าเลือกกรอง จะหาคำว่า "รุนแรง" หรือ "Severe" ในระดับคะแนนใดคะแนนหนึ่ง
    const filteredData = data.filter(item => {
        if (!filterHighRisk) return true; // ถ้าไม่ได้ติ๊กเลือก ให้แสดงทั้งหมด

        const checkRisk = (level?: string) => {
            if (!level) return false;
            // เช็คว่ามีคำว่า รุนแรง หรือ Severe หรือไม่ (ครอบคลุม รุนแรงมาก)
            return level.includes('รุนแรง') || level.includes('Severe');
        };

        return checkRisk(item.depression_level) ||
            checkRisk(item.anxiety_level) ||
            checkRisk(item.stress_level);
    });

    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">ตรวจสอบแบบประเมิน</h2>

            {/* Loading UI */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                    <p>กำลังโหลดข้อมูล...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <p className="text-lg">ไม่พบข้อมูลแบบประเมิน</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center mt-10 px-4 w-full">

                    {/* 3. ส่วนควบคุมตัวกรอง (Filter UI) */}
                    <div className="w-full max-w-[1200px] mb-4 flex justify-end">
                        <label className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all border
                            ${filterHighRisk
                                ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}
                        `}>
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-red-500"
                                checked={filterHighRisk}
                                onChange={(e) => setFilterHighRisk(e.target.checked)}
                            />
                            <span className="font-medium select-none">แสดงเฉพาะกลุ่มเสี่ยงสูง (รุนแรง)</span>
                        </label>
                    </div>

                    <div className="bg-white w-full rounded-lg shadow-lg p-5 overflow-x-auto">
                        <table className="min-w-[600px] w-full text-left">
                            <thead>
                                <tr className="text-gray-700 text-center">
                                    <th className="border-b-2 border-gray-300 p-2">ID</th>
                                    <th className="border-b-2 border-gray-300 p-2">ชื่อ</th>
                                    <th className="border-b-2 border-gray-300 p-2">เบอร์โทร</th>
                                    <th className="border-b-2 border-gray-300 p-2">ภาวะซึมเศร้า</th>
                                    <th className="border-b-2 border-gray-300 p-2">ภาวะวิตกกังวล</th>
                                    <th className="border-b-2 border-gray-300 p-2">ภาวะเครียด</th>
                                    <th className="border-b-2 border-gray-300 p-2">วันที่ทำแบบทดสอบ</th>
                                    <th className="border-b-2 border-gray-300 p-2">จัดการ</th>
                                </tr>
                            </thead>

                            <tbody>
                                {/* 4. เปลี่ยนจาก data.map เป็น filteredData.map */}
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id} className="text-gray-700 text-center hover:bg-gray-50">
                                            <td className="border-b border-gray-200 p-2">{item.user_consent?.student_id}</td>
                                            <td className="border-b border-gray-200 p-2">{item.user_consent?.name}</td>
                                            <td className="border-b border-gray-200 p-2">{item.user_consent?.phone}</td>

                                            {/* เพิ่มสีแดงถ้ามีความเสี่ยงสูงในช่องนั้นๆ */}
                                            <td className={`border-b border-gray-200 p-2 ${item.depression_level?.includes('รุนแรง') ? 'text-red-600 font-bold' : ''}`}>
                                                {item.depression_score} / {item.depression_level}
                                            </td>
                                            <td className={`border-b border-gray-200 p-2 ${item.anxiety_level?.includes('รุนแรง') ? 'text-red-600 font-bold' : ''}`}>
                                                {item.anxiety_score} / {item.anxiety_level}
                                            </td>
                                            <td className={`border-b border-gray-200 p-2 ${item.stress_level?.includes('รุนแรง') ? 'text-red-600 font-bold' : ''}`}>
                                                {item.stress_score} / {item.stress_level}
                                            </td>

                                            <td className="border-b border-gray-200 p-2">
                                                {item.created_at
                                                    ? typeof item.created_at === 'string'
                                                        ? formatThaiDate(item.created_at)
                                                        : new Date(item.created_at).toLocaleDateString('th-TH')
                                                    : '-'}
                                            </td>
                                            <td className="border-b border-gray-200 p-2">
                                                <button
                                                    className="text-red-500 bg-red-50 hover:bg-red-100 py-1 px-3 rounded font-bold transition-colors"
                                                    onClick={() => handleRemove(item.id)}
                                                >
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-gray-500">
                                            ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
}
export default MentalhealthEvaluations