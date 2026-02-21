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

            {/*  ปุ่มกลับ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition"
                >
                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200">
                        ←
                    </span>
                    กลับไปหน้ารายการ
                </button>

                <h1 className="text-xl sm:text-2xl font-bold text-purple-700">
                    ประวัติแบบประเมิน DASS-21
                </h1>
            </div>

            {/* ข้อมูลผู้ทำแบบประเมิน */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-10">
                <h2 className="font-semibold text-gray-700 mb-4">
                    ข้อมูลผู้ทำแบบประเมิน
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm sm:text-base">
                    <div>
                        <p className="text-gray-500">ชื่อ</p>
                        <p className="font-medium">{user?.name ?? "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">รหัสนิสิต</p>
                        <p className="font-medium">{user?.student_id ?? "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">เบอร์โทร</p>
                        <p className="font-medium">{user?.phone ?? "-"}</p>
                    </div>
                </div>
            </div>

            {/*  Pagination Controls */}
            <div className="flex items-center justify-between mb-8 bg-white rounded-xl shadow-sm px-4 py-3">

                <button
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
                >
                    ← ก่อนหน้า
                </button>

                <span className="text-sm font-semibold text-gray-700">
                    ประวัติครั้งที่ {data.length - currentPage} จาก {data.length}
                </span>

                <button
                    disabled={currentPage === data.length - 1}
                    onClick={() => setCurrentPage(p => p + 1)}
                    className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition"
                >
                    ถัดไป →
                </button>

            </div>

            {/*  คำอธิบายระดับคะแนน */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-8">
                <h3 className="text-sm font-semibold text-purple-700 mb-3">
                    เกณฑ์การให้คะแนน (DASS-21)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-center">
                        <span className="font-bold text-purple-700">0</span>
                        <p className="text-gray-600">ไม่เคย</p>
                    </div>

                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-center">
                        <span className="font-bold text-purple-700">1</span>
                        <p className="text-gray-600">บางครั้ง</p>
                    </div>

                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-center">
                        <span className="font-bold text-purple-700">2</span>
                        <p className="text-gray-600">บ่อยครั้ง</p>
                    </div>

                    <div className="bg-white rounded-lg px-3 py-2 shadow-sm text-center">
                        <span className="font-bold text-purple-700">3</span>
                        <p className="text-gray-600">เป็นประจำ</p>
                    </div>
                </div>
            </div>

            {/*  การประเมิน */}
            <div
                key={assessment.id}
                className="bg-white shadow rounded-xl p-4 sm:p-6 mb-10"
            >
                <p className="text-gray-500 text-sm sm:text-base mb-6 text-center sm:text-left">
                    วันที่ทำ:{" "}
                    {new Date(assessment.created_at).toLocaleDateString("th-TH")}
                </p>

                {/*  สรุปคะแนน */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 text-center">
                        <p className="text-sm font-medium text-purple-700">Depression</p>
                        <p className="text-4xl font-bold text-purple-800 mt-2">
                            {assessment.depression_score}
                        </p>
                        <p className="text-sm mt-1">
                            ระดับ: {assessment.depression_level}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 text-center">
                        <p className="text-sm font-medium text-blue-700">Anxiety</p>
                        <p className="text-4xl font-bold text-blue-800 mt-2">
                            {assessment.anxiety_score}
                        </p>
                        <p className="text-sm mt-1">
                            ระดับ: {assessment.anxiety_level}
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 text-center">
                        <p className="text-sm font-medium text-green-700">Stress</p>
                        <p className="text-4xl font-bold text-green-800 mt-2">
                            {assessment.stress_score}
                        </p>
                        <p className="text-sm mt-1">
                            ระดับ: {assessment.stress_level}
                        </p>
                    </div>

                </div>

                {/*  คำถาม + คำตอบ */}
                <div className="space-y-4">
                    {assessment.dass_21_answer
                        .sort((a, b) => a.question_number - b.question_number)
                        .map((answer) => {
                            const question = DASS_21[answer.question_number - 1];

                            const typeStyle =
                                question?.type === "D"
                                    ? "bg-purple-100 text-purple-700"
                                    : question?.type === "A"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700";

                            return (
                                <div
                                    key={answer.id}
                                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                                        <p className="font-medium text-gray-800 sm:w-4/5">
                                            {answer.question_number}. {question?.text}
                                        </p>

                                        <span className={`text-xs px-3 py-1 rounded-full ${typeStyle}`}>
                                            {question?.type === "D"
                                                ? "Depression"
                                                : question?.type === "A"
                                                    ? "Anxiety"
                                                    : "Stress"}
                                        </span>
                                    </div>

                                    <div className="mt-3 text-sm font-semibold text-purple-700">
                                        คำตอบ: {scoreMap[answer.score]}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>
        </div>
    );
}