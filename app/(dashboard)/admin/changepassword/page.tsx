'use client'
import { useState, useEffect } from 'react';

type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const AdminChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const [data, setData] = useState<User | null>(null)

    useEffect(() => {
        FecthUser();
    }, [])

    const FecthUser = async () => {
        try {
            const res = await fetch('/api/auth/token', {
                method: 'GET',
                credentials: "include",
            });

            const data = await res.json();
            // console.log("Data:", data);

            if (res.ok) {
                setData(data.user);
            }
            // } else {
            //     console.log("ไม่พบ token หรือ token ไม่ถูกต้อง:", data.message);
            // }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
        }
    }

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


    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">เปลี่ยนรหัสผ่าน</h2>
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
    )
}
export default AdminChangePassword