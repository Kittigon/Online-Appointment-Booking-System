'use client'

import { useState, useEffect } from "react";
import type { dass_21_result } from "@prisma/client";

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

const AdminEvaluations = () => {
    const [data, setData] = useState<dass_21_result[]>([]);

    useEffect(() => {
        loadData();
    }, [])

    const loadData = async () => {
        try {
            const res = await fetch('/api/dass21')
            const data = await res.json();

            // console.log(data.dass21List)
            setData(data.dass21List)

        } catch (error) {
            console.log("โหลดข้อมูลล้มเหลว:", error);
        }
    }

    const handleRemove = async (id: number) => {
        // Optional: Add a confirmation dialog
        if (!confirm(`คุณต้องการลบข้อมูล ID: ${id} ใช่หรือไม่?`)) {
            return;
        }

        try {
            const res = await fetch(`/api/dass21/${id}`, {
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
    
    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">การทำแบบประเมิน</h2>
            <div className="flex flex-col items-center justify-center mt-10 px-4 w-full">
                <div className="bg-white w-full  rounded-lg shadow-lg p-5 overflow-x-auto">
                    <table className="min-w-[600px] w-full text-left">
                        <thead>
                            <tr className=" text-gray-700 text-center">
                                <th className="border-b-2 border-gray-300 p-2">ID</th>
                                <th className="border-b-2 border-gray-300 p-2">คะแนน/ความเสี่ยงของ ภาวะซึมเศร้า</th>
                                <th className="border-b-2 border-gray-300 p-2">คะแนน/ความเสี่ยงของ ภาวะวิตกกังวล</th>
                                <th className="border-b-2 border-gray-300 p-2">คะแนน/ความเสี่ยงของ ภาวะเครียด</th>
                                <th className="border-b-2 border-gray-300 p-2">วันที่ทำแบบทดสอบ</th>
                                <th className="border-b-2 border-gray-300 p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item =>
                                <tr key={item.id} className="text-gray-700  text-center">
                                    <td className="border-b border-gray-200 p-2">{item.id}</td>
                                    <td className="border-b border-gray-200 p-2">{item.depression_score} / {item.depression_level}</td>
                                    <td className="border-b border-gray-200 p-2">{item.anxiety_score} / {item.anxiety_level}</td>
                                    <td className="border-b border-gray-200 p-2">{item.stress_score} / {item.stress_level}</td>
                                    <td className="border-b border-gray-200 p-2">
                                        {item.created_at
                                            ? typeof item.created_at === 'string'
                                                ? formatThaiDate(item.created_at)
                                                : new Date(item.created_at).toLocaleDateString('th-TH')
                                            : '-'}
                                    </td>
                                    <td className="border-b border-gray-200 p-2">
                                        <button className="text-red-500 bg-gray-100 py-2 px-4 font-bold active:bg-black"
                                            onClick={() => { handleRemove(item.id) }}
                                        >X</button>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
export default AdminEvaluations