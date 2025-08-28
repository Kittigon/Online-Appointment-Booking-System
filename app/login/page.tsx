'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { UserRound } from 'lucide-react'

type User = {
    id: number;
    email: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
        const messages = [
        "วันนี้คุณรู้สึกยังไงบ้าง?",
        "เราพร้อมสนับสนุนคุณเสมอ 💜",
        "ดีใจที่ได้พบคุณอีกครั้ง 😊",
        "แค่คุณเข้ามาก็เป็นก้าวที่ดีแล้ว",
        "สุขภาพใจของคุณสำคัญที่สุด",
        "ทุกวันที่คุณพยายาม คือความกล้าหาญ",
        "คุณไม่ได้อยู่คนเดียว 💪",
        "กลับมาเติมพลังใจกันเถอะ 🌱"
    ]
    const [msgIndex, setMsgIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [messages.length])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            setError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('เข้าสู่ระบบสำเร็จ');
                setEmail('');
                setPassword('');


                // ดึง user จาก token หลัง login สำเร็จ
                const userRes = await fetch('/api/token', {
                    method: 'GET',
                    credentials: 'include',
                });
                const userData = await userRes.json();

                if (userRes.ok) {
                    const user: User = userData.user;
                    if (user.role === "USER") {
                        window.location.href = "/user/appointment";
                    } else if (user.role === "MENTALHEALTH") {
                        window.location.href = "/mentalhealth/appointment";
                    } else if (user.role === "ADMIN") {
                        window.location.href = "/admin/dashboard";
                    }
                } else {
                    setError("เข้าสู่ระบบสำเร็จ แต่ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                }

            } else {
                if (data.message === 'Invalid email or password') {
                    setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                } else {
                    setError(data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
    };




    return (
        <>
            <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold  ">เข้าสู่ระบบ</h1>
            </div>

            <div className='flex items-center justify-center p-10'>
                <div className="grid grid-cols-1 lg:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full">

                    {/* ฝั่งซ้าย Welcome */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 text-purple-500 p-10  text-center">
                        <h1 className="text-3xl font-bold mb-4">ยินดีต้อนรับกลับ!</h1>
                        <p className="text-lg leading-relaxed">{messages[msgIndex]}</p>
                    </div>

                    {/* แบบฟอร์ม Login */}
                    <div className="p-8 sm:p-10 w-full">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <h2 className="text-3xl font-bold text-center text-purple-500 mb-2">เข้าสู่ระบบ</h2>
                            <hr className="border-gray-300 mb-4" />

                            <div>
                                <label className="block text-gray-700">อีเมล</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700">รหัสผ่าน</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            {/* ปุ่มมีไอคอน 👤 */}
                            <button
                                type="submit"
                                className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition duration-200 flex items-center justify-center gap-2"
                            >
                                <UserRound className="w-5 h-5" />
                                เข้าสู่ระบบ
                            </button>

                            {/* ลิงก์สมัครสมาชิก */}
                            <p className="text-center text-sm text-gray-600">
                                ยังไม่มีบัญชีใช่ไหม?{' '}
                                <Link href="/register" className="text-purple-500 underline hover:text-purple-700">
                                    สมัครสมาชิก
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage
