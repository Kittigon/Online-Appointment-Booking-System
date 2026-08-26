'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { UserRound, Eye, EyeOff } from 'lucide-react'
import { loginSchema } from '@/schemas/login'
import toast from 'react-hot-toast'

type User = {
    id: number;
    email: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const LoginPage = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
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

    const isChecked = useRef(false);

    useEffect(() => {
        // ✅ ถ้าเคยเช็คไปแล้วในรอบ Render นี้ ให้หยุด (แก้ปัญหา React Strict Mode)
        if (isChecked.current) return;
        isChecked.current = true;

        const checkAutoLogin = async () => {
            try {
                const res = await fetch('/api/auth/token', {
                    method: 'GET',
                    credentials: 'include',
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data?.user) {
                        sessionStorage.removeItem("login_retry_flag");
                        // Redirect logic...
                        if (data.user.role === "USER") window.location.href = "/user/appointment";
                        else if (data.user.role === "MENTALHEALTH") window.location.href = "/mentalhealth/appointment";
                        else if (data.user.role === "ADMIN") window.location.href = "/admin/dashboard";
                    }
                } else {
                    // ⚠️ Logic การ Reload
                    const hasRetried = sessionStorage.getItem("login_retry_flag");

                    // ต้องเช็คว่า response ไม่ใช่ 200 และยังไม่เคย reload
                    if (!hasRetried) {
                        console.log("Auto-login check failed. Reloading page once...");
                        sessionStorage.setItem("login_retry_flag", "true");

                        // ✅ ใส่ Timeout เล็กน้อยเพื่อให้ sessionStorage บันทึกทัน
                        setTimeout(() => {
                            window.location.reload();
                        }, 100);
                    } else {
                        console.log("Reloaded already. Clear flag.");
                        sessionStorage.removeItem("login_retry_flag");
                    }
                }
            } catch (error) {
                console.error("Error checking token:", error);
                // logic error handling...
            }
        };

        checkAutoLogin();
    }, []); // Empty dependency array

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [messages.length])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const parsed = loginSchema.safeParse({ email, password });

        if (!parsed.success) {
            toast.error(parsed.error.issues[0].message);
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // setSuccess(true);
                toast.success('เข้าสู่ระบบสำเร็จ !');
                setEmail('');
                setPassword('');


                // ดึง user จาก token หลัง login สำเร็จ
                const userRes = await fetch('/api/auth/token', {
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
                    toast.error("เข้าสู่ระบบสำเร็จ แต่ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                }

            } else {
                if (data.message === 'Invalid email or password') {
                    toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
                } else {
                    toast.error(data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
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
                                    placeholder='ป้อนอีเมลของคุณ'
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700">รหัสผ่าน</label>
                                <div className="relative">
                                    <input
                                        placeholder='ป้อนรหัสผ่านของคุณ'
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 mt-[2px] text-gray-500 hover:text-purple-500"
                                    >
                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

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
