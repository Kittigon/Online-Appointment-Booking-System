'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';


type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}


export default function EditProfile() {
    const [formdata, setFormdata] = useState({
        name: '',
        email: '',
        gender: '',
        age: 0,
    });
    const [data, setData] = useState<User | null>(null)
    const [loading, setLoading] = useState(true);

    // ฟังก์ชันดึง user token
    const FecthUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/token", {
                method: "GET",
                credentials: "include",
            })
            const result = await res.json()
            if (res.ok) {
                setData(result.user)
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error)
        }
    }, [])

    // ฟังก์ชันโหลดข้อมูล user
    const loadData = useCallback(async () => {
        if (!data?.id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/user/${data.id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const result = await res.json();
            setFormdata(result.showuser);
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
        } finally {
            setLoading(false);
        }
    }, [data?.id]);

    // useEffect เรียก FecthUser
    useEffect(() => {
        FecthUser()
    }, [FecthUser])

    // useEffect เรียก loadData เมื่อ data เปลี่ยน
    useEffect(() => {
        loadData()
    }, [loadData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormdata(prev => ({
            ...prev,
            [name]: name === 'age' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // console.log('Saving profile:', formdata);
        const id = data?.id;
        try {
            const res = await fetch('/api/user/' + id, {
                method: "PUT",
                headers: {
                    'Content-Type': 'applications/json'
                },
                body: JSON.stringify(formdata)
            })

            if (res.ok) {
                alert('แก้ไขข้อมูลสำเร็จ !!! ')
                loadData();
            }

        } catch (error) {
            console.log('เกิดข้อผิดพลาดในการแก้ไขข้อมูล : ', error)
        }
    };

    if (loading) {
        return (
            <>
                <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                    <h1 className="text-xl font-bold  ">โปรไฟล์</h1>
                </div>
                <div className=" flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="
            bg-[#B67CDE] w-[250px] h-10 text-white p-10 mt-7 flex items-center justify-center rounded-tr-sm rounded-br-sm">
                <h1 className="text-xl font-bold  ">โปรไฟล์</h1>
            </div>
            <div className=" flex items-center justify-center px-4 py-10">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2">
                    {/* ซ้าย: welcome */}
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 text-purple-500 p-10">
                        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
                        <p className="text-lg">มาแก้ไขข้อมูลของคุณกันเถอะ 💜</p>
                    </div>

                    {/* ขวา: ฟอร์ม */}
                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-center text-purple-600 mb-6">แก้ไขข้อมูลส่วนตัว</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formdata.name}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อีเมล</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formdata.email}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">เพศ</label>
                                <select
                                    name="gender"
                                    value={formdata.gender || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">-- กรุณาเลือกเพศ --</option>
                                    <option value="ชาย">ชาย</option>
                                    <option value="หญิง">หญิง</option>
                                    <option value="อื่นๆ">อื่นๆ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">อายุ</label>
                                <input
                                    type="number"
                                    name="age"
                                    min="18"
                                    value={formdata.age || ''}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>

                            <div className="text-right">
                                <Link href="/changepassword" className="text-sm text-purple-500 hover:underline">
                                    เปลี่ยนรหัสผ่าน
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-purple-500 text-white py-2 rounded-xl hover:bg-purple-600 transition duration-200"
                            >
                                บันทึกข้อมูล
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
