'use client';

import { useState, useEffect, useCallback } from 'react';

type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}


export default function ChangePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const [data, setData] = useState<User | null>(null)

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUser();
    }, [])

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/token', {
                method: 'GET',
                credentials: "include",
            });

            const result = await res.json();

            if (res.ok && result.user) {
                setData(result.user);
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = data?.id;

        if (!password || !confirmPassword) {
            setError('กรุณาป้อนข้อมูลให้ครบถ้วน')
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }
        setError('');
        // console.log('New Password:', password);

        try {
            const res = await fetch('/api/user/' + id, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'applications/json'
                },
                body: JSON.stringify({ password })
            })

            if (res.ok) {
                alert('แก้ไขรหัสผ่านเรียบร้อย!')
                setPassword('')
                setConfirmPassword('')
            }

        } catch (error) {
            console.log('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน :', error)
        }
    };

    if (loading) {
        return (
            <>
                <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                    <h1 className="text-xl font-bold  ">เปลี่ยนรหัสผ่าน</h1>
                </div>
                <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                            <p>กำลังโหลดข้อมูล...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold  ">เปลี่ยนรหัสผ่าน</h1>
            </div>
            <main className="flex items-center justify-center px-4 py-10">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2">
                    {/* ซ้าย: welcome */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 text-purple-500 p-10">
                        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
                        <p className="text-lg">ตั้งรหัสผ่านใหม่เพื่อความปลอดภัยของคุณ 💜</p>
                    </div>

                    {/* ขวา: ฟอร์มเปลี่ยนรหัส */}
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-center text-purple-600 mb-6">เปลี่ยนรหัสผ่าน</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition duration-200"
                            >
                                บันทึกรหัสผ่าน
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
