'use client'
import { useState } from "react"

export default function AdminUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const handleUpload = async () => {
        if (!file) {
            setError("กรุณาเลือกไฟล์ก่อนอัปโหลด");
            return;
        }
        setError("");
        const formData = new FormData();
        formData.append("file", file);
        setStatus("กำลังอัปโหลด...");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setStatus(data.message);
        } catch (err) {
            console .error(err);
            setError("เกิดข้อผิดพลาดระหว่างอัปโหลด");
            setStatus("");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-6">
                    อัปโหลดไฟล์ CSV
                </h2>

                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-700 font-medium">เลือกไฟล์ CSV:</span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            className="mt-2 block w-full text-gray-700 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                        />
                    </label>

                    <button
                        onClick={handleUpload}
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!file}
                    >
                        อัปโหลด
                    </button>

                    {status && (
                        <p className="text-green-600 text-center font-medium animate-pulse mt-2">
                            {status}
                        </p>
                    )}

                    {error && (
                        <p className="text-red-500 text-center font-medium mt-2">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
