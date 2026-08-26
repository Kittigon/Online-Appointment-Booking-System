'use client';
import { useState, useEffect } from 'react'
import Link from "next/link"
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { registerSchema } from '@/schemas/register';
import toast from 'react-hot-toast'

const RegisterPage = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const messages = [
        "ยินดีต้อนรับสู่พื้นที่ปลอดภัย 💜",
        "ยินดีที่คุณเริ่มต้นกับเรา 😊",
        "การดูแลใจเริ่มได้ตั้งแต่วันนี้",
        "ทุกก้าวที่คุณเริ่ม มีความหมายเสมอ",
        "ขอบคุณที่เลือกดูแลตัวเอง 🪷",
        "มาเริ่มต้นการเดินทางของใจไปด้วยกัน 🌈",
        "ที่นี่คือพื้นที่ของความเข้าใจและการเยียวยา",
        "คุณกล้าหาญมากที่เริ่มต้น ✨",
        "เราอยู่ตรงนี้เพื่อคุณเสมอ 🤝"
    ]
    const [msgIndex, setMsgIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [messages.length])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()


        const parsed = registerSchema.safeParse({ name, email, password});

        if (!parsed.success) {
            toast.error(parsed.error.issues[0].message);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            })

            const data = await res.json()

            if (res.ok) {
                // Registration successful
                toast.success("สมัครสมาชิกสำเร็จ !")
                // Clear form
                setName("")
                setEmail("")
                setPassword("")

            } else {
                // Handle errors
                if (data.message === "Email already exists") {
                    toast.error("อีเมลนี้ถูกใช้ไปแล้ว")
                } else {
                    toast.error(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
                }
            }
        } catch (error) {
            console.error("Registration error:", error)
            toast.error("เกิดข้อผิดพลาดในการสมัครสมาชิก")
        }
    }

    return (
        <>
            <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold  ">สมัครสมาชิก</h1>
            </div>

            <div className="flex items-center justify-center p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 bg-white shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full">
                    {/* ฝั่งซ้าย (Welcome Message) */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 text-purple-500 text-center   ">
                        <h1 className="text-4xl font-bold mb-4">ยินดีต้อนรับ!</h1>
                        <p className="text-lg leading-relaxed">
                            {messages[msgIndex]}
                        </p>
                    </div>

                    {/* แบบฟอร์ม */}
                    <div className="p-8 sm:p-10 w-full">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5">
                            <h2 className="text-3xl font-bold text-center text-purple-500 mb-2">สมัครสมาชิก</h2>
                            <hr className="border-gray-300 mb-4" />

                            <div>
                                <label className="block text-gray-700">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    value={name}
                                    placeholder='ป้อนชื่อและนามสกุลของคุณ'
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">อีเมล</label>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder='ป้อนอีเมลของคุณ'
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full mt-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700">รหัสผ่าน</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        placeholder='ป้อนรหัสผ่านของคุณ'
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

                            {/* Error Messages */}

                            <button
                                type="submit"
                                className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition duration-200 flex items-center justify-center gap-2"
                            >
                                <UserPlus className="w-5 h-5" />
                                สมัครสมาชิก
                            </button>

                            <p className="text-center text-sm text-gray-600">
                                มีบัญชีแล้วใช่ไหม?{" "}
                                <Link href="/login" className="text-purple-500 underline hover:text-purple-700">
                                    เข้าสู่ระบบ
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
export default RegisterPage