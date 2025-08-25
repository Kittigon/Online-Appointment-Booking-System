'use client'
import { useState, useEffect} from 'react'
import Link from "next/link"
import Image from "next/image"
import { LockKeyholeOpen, Menu } from 'lucide-react'

type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const Navbar = () => {
    // const role: string = "user" // This should be dynamically set based on user role
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
    const [data, setData] = useState<User | null>(null)

    useEffect(() => {
        FecthUser();
    }, [])

    const FecthUser = async () => {
        try {
            const res = await fetch('/api/token', {
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

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/logout', {
                method: 'POST',
                credentials: "include",
            });

            if (res.ok) {
                setData(null); // Clear user data on successful logout
                window.location.href = '/login'; // Redirect to login page
                FecthUser();
            } else {
                const errorData = await res.json();
                console.error("Logout failed:", errorData.error);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error("Logout Error: ", error.message);
            } else {
                console.error("Unknown error in logout: ", error);
            }
        }
    }



    return (
        <main>
            <div className="bg-[#8D38C9] w-screen h-8"></div>
            <div className="bg-[#E6E6E6] px-4 md:px-7 py-4">
                <nav className="flex justify-between items-center">
                    {/* LOGO */}
                    <button className="flex items-center gap-2">
                        <Image
                            className="rounded-full"
                            src="/ตรามหาลัยพะเยา.png"
                            height={40}
                            width={40}
                            alt="Logo"
                        />
                    </button>

                    {/* Mobile Hamburger */}
                    {data && (data.role === "USER" || data.role === "MENTALHEALTH") && (
                        <div className="md:hidden">
                            <button onClick={() => setMenuOpen(!menuOpen)}>
                                <Menu />
                            </button>
                        </div>
                    )}

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex gap-10 text-black items-center">
                        {data?.role === "USER" && (
                            <>
                                <li><Link href="/user/appointment" className="hover:underline">ตารางนัดหมาย</Link></li>
                                <li><Link href="/user/infocheck" className="hover:underline">ตรวจสอบการนัดหมาย</Link></li>
                                <li><Link href="/user/history" className="hover:underline">ประวัติการนัดหมาย</Link></li>
                            </>
                        )}
                        {data?.role === "MENTALHEALTH" && (
                            <>
                                <li><Link href="/mentalhealth/appointment" className="hover:underline">ปฏิทินการนัดพบ</Link></li>
                                <li><Link href="/mentalhealth/evaluations" className="hover:underline">ตรวจสอบแบบประเมิน</Link></li>
                                <li><Link href="/mentalhealth/history" className="hover:underline">ประวัติบุคลากร</Link></li>
                            </>
                        )}
                        {/* {data?.role === "ADMIN" && (
                            <>
                                <li><Link href="/admin/dashboard" className="hover:underline">Dashboard</Link></li>
                                <li><Link href="/admin/manage" className="hover:underline">จัดการผู้ใช้</Link></li>
                            </>
                        )} */}

                        {!data && (
                            <li><Link href="/login"><LockKeyholeOpen /></Link></li>
                        )}

                        {/* Dropdown Settings */}
                        {data && (data?.role === "USER" || data?.role === "MENTALHEALTH") && (
                            <li className="relative pt-2">
                                <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <div className="avatar avatar-placeholder">
                                        <div className="bg-neutral text-neutral-content w-10 rounded-full">
                                            <span>
                                                {data?.name
                                                    ?.split(" ")
                                                    .map(word => word[0])
                                                    .slice(0, 2)
                                                    .join("")
                                                    .toUpperCase()}
                                            </span>

                                        </div>
                                    </div>
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <ul className="text-sm text-gray-700">
                                            <li>
                                                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">โปรไฟล์</Link>
                                            </li>
                                            <li>
                                                <Link href="/changepassword" className="block px-4 py-2 hover:bg-gray-100">เปลี่ยนรหัสผ่าน</Link>
                                            </li>
                                            <li>
                                                <button onClick={() => { handleLogout() }} className="block px-4 py-2 w-full text-left hover:bg-gray-100 text-red-600">ออกจากระบบ</button>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>

                {/* Mobile Menu Dropdown */}
                {menuOpen && (
                    <div className="md:hidden mt-4 space-y-2 text-left">
                        {data?.role === "USER" && (
                            <>
                                <Link href="/user/appointment" className="block hover:underline">ตารางนัดหมาย</Link>
                                <Link href="/user/infocheck" className="block hover:underline">ตรวจสอบการนัดหมาย</Link>
                                <Link href="/user/history" className="block hover:underline">ประวัติการนัดหมาย</Link>
                            </>
                        )}
                        {data?.role === "MENTALHEALTH" && (
                            <>
                                <Link href="/mentalhealth/appointment" className="block hover:underline">ปฏิทินการนัดพบ</Link>
                                <Link href="/mentalhealth/evaluations" className="block hover:underline">ตรวจสอบแบบประเมิน</Link>
                                <Link href="/mentalhealth/history" className="block hover:underline">ประวัติบุคลากร</Link>
                            </>
                        )}
                        {data?.role === "ADMIN" && (
                            <>
                                <Link href="/admin/dashboard" className="block hover:underline">Dashboard</Link>
                                <Link href="/admin/manage" className="block hover:underline">จัดการผู้ใช้</Link>
                            </>
                        )}
                        <div className=" gap-4 mt-2">
                            {!data && (
                                <Link href="/" className='block mt-2'>เข้าสู่ระบบ</Link>
                            )}

                            <div className="mt-2">
                                {data && (
                                    <button
                                        onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                                        className="block w-full text-left hover:underline "
                                    >
                                        ตั้งค่า ▾
                                    </button>
                                )}

                                {mobileDropdownOpen && (
                                    <div className="ml-4 mt-1 space-y-1 text-sm">
                                        <Link href="/profile" className="block hover:underline">โปรไฟล์</Link>
                                        <Link href="/changepassword" className="block hover:underline">เปลี่ยนรหัสผ่าน</Link>
                                        <button onClick={() => { handleLogout() }} className="block hover:underline text-red-600">ออกจากระบบ</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default Navbar
