'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DASS_21 } from "@/utils/dass21";

const scoreMap: Record<number, string> = {
    0: "ไม่เคย",
    1: "บางครั้ง",
    2: "บ่อยครั้ง",
    3: "เป็นประจำ"
};

interface Dass21Answer {
    id: number;
    question_number: number;
    score: number;
}

interface UserConsent {
    name?: string;
    student_id?: string;
    phone?: string;
}

interface Dass21Assessment {
    id: number;
    created_at: string;
    depression_score: number;
    depression_level: string;
    anxiety_score: number;
    anxiety_level: string;
    stress_score: number;
    stress_level: string;
    user_consent?: UserConsent;
    dass_21_answer: Dass21Answer[];
}

export default function DetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [data, setData] = useState<Dass21Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        fetch(`/api/assessments/dass21/${id}`)
            .then(res => res.json())
            .then(res => {
                setData(res);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
        <p>กำลังโหลดข้อมูล...</p>
    </div>;
    if (data.length === 0) return <div className="p-6 text-center">ไม่พบข้อมูล</div>;

    const assessment = data[currentPage];
    const user = assessment?.user_consent;


    return (
        <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

            {/* 🔙 ปุ่มกลับใหม่ */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 mb-6 text-purple-700 hover:text-purple-900 font-medium transition"
            >
                <span className="bg-purple-100 hover:bg-purple-200 transition px-3 py-1 rounded-full">
                    ←
                </span>
                กลับ
            </button>

            <h1 className="text-xl sm:text-2xl font-bold text-purple-700 mb-6 text-center sm:text-left">
                ประวัติแบบประเมิน DASS-21
            </h1>

            {/* 👤 ข้อมูลผู้ใช้ */}
            <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-8">
                <h2 className="font-semibold text-base sm:text-lg mb-3 text-gray-700">
                    ข้อมูลผู้ทำแบบประเมิน
                </h2>
                <p className="text-sm sm:text-base">ชื่อ: {user?.name ?? "-"}</p>
                <p className="text-sm sm:text-base">รหัสนิสิต: {user?.student_id ?? "-"}</p>
                <p className="text-sm sm:text-base">เบอร์โทร: {user?.phone ?? "-"}</p>
            </div>

            {/* 🔢 Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                    ⬅ ก่อนหน้า
                </button>

                <span className="font-semibold text-sm sm:text-base">
                    ครั้งที่ {data.length - currentPage} / {data.length}
                </span>

                <button
                    disabled={currentPage === data.length - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
                >
                    ถัดไป ➡
                </button>
            </div>

            {/* 📊 การประเมิน */}
            <div
                key={assessment.id}
                className="bg-white shadow rounded-xl p-4 sm:p-6 mb-10"
            >
                <p className="text-gray-500 text-sm sm:text-base mb-6 text-center sm:text-left">
                    วันที่ทำ:{" "}
                    {new Date(assessment.created_at).toLocaleDateString("th-TH")}
                </p>

                {/* 🔢 สรุปคะแนน */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                        <p className="font-semibold text-sm">Depression</p>
                        <p className="text-2xl font-bold text-purple-700">
                            {assessment.depression_score}
                        </p>
                        <p className="text-sm">ระดับ: {assessment.depression_level}</p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                        <p className="font-semibold text-sm">Anxiety</p>
                        <p className="text-2xl font-bold text-blue-700">
                            {assessment.anxiety_score}
                        </p>
                        <p className="text-sm">ระดับ: {assessment.anxiety_level}</p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <p className="font-semibold text-sm">Stress</p>
                        <p className="text-2xl font-bold text-green-700">
                            {assessment.stress_score}
                        </p>
                        <p className="text-sm">ระดับ: {assessment.stress_level}</p>
                    </div>

                </div>

                {/* 📋 คำถาม + คำตอบ */}
                <div>
                    <h3 className="font-semibold mb-4 text-gray-700 text-sm sm:text-base">
                        รายละเอียดคำตอบ (21 ข้อ)
                    </h3>

                    {assessment.dass_21_answer
                        .sort((a: Dass21Answer, b: Dass21Answer) => a.question_number - b.question_number)
                        .map((answer: Dass21Answer) => {
                            const question = DASS_21[answer.question_number - 1];

                            return (
                                <div
                                    key={answer.id}
                                    className="border-b py-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <p className="font-medium text-gray-800 text-sm sm:text-base sm:w-4/5">
                                            {question?.text}
                                        </p>

                                        <span className={`text-xs px-2 py-1 rounded self-start ${question?.type === "D"
                                                ? "bg-purple-100 text-purple-700"
                                                : question?.type === "A"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}>
                                            {question?.type === "D"
                                                ? "Depression"
                                                : question?.type === "A"
                                                    ? "Anxiety"
                                                    : "Stress"}
                                        </span>
                                    </div>

                                    <p className="mt-2 font-semibold text-purple-600 text-sm sm:text-base">
                                        คำตอบ: {scoreMap[answer.score]}
                                    </p>
                                </div>
                            );
                        })}
                </div>
            </div>

        </div>
    );
}