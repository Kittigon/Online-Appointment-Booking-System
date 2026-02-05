'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from "next/link"
import Image from "next/image"
import { LockKeyholeOpen, Menu, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'

type User = {
    id: number;
    email: string;
    name: string
    role: "USER" | "MENTALHEALTH" | "ADMIN";
}

const Navbar = () => {
    const pathname = usePathname()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false)
    const [data, setData] = useState<User | null>(null)
    const [unreadCount, setUnreadCount] = useState(0);

    const FecthUser = useCallback(async () => {
        if (pathname === '/login' || pathname === '/register') return;
        
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
    }, [pathname])

    // Fetch unread notifications count
    const fetchUnreadNotifications = useCallback(async () => {
        if (!data?.id) return;
        const userId = data?.id;

        try {
            const res = await fetch('/api/system/notifications/unread-count/' + userId, {
                method: 'GET',
                credentials: "include",
                cache: "no-store"
            });

            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error(err);
        }
    }, [data?.id]);

    useEffect(() => {
        FecthUser();
    }, [FecthUser]);

    useEffect(() => {
        if (data?.id) {
            fetchUnreadNotifications();
        }
    }, [data?.id, fetchUnreadNotifications]);

    useEffect(() => {
        const handler = () => {
            fetchUnreadNotifications();
        };

        window.addEventListener("notifications-read", handler);

        return () => {
            window.removeEventListener("notifications-read", handler);
        };
    }, [fetchUnreadNotifications]);


    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: "include",
            });

            if (res.ok) {
                setData(null);
                window.location.href = '/login';
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
                    <button className="fflex items-center gap-2 bg-transparent border-none">
                        <Image
                            className="rounded-full object-cover"
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
                                <li className="relative">
                                    <Link href="/user/notifications">
                                        <Bell />
                                        {unreadCount > 0 && (
                                            <span className="
                absolute -top-1 -right-1
                bg-red-500 text-white text-xs
                rounded-full w-5 h-5
                flex items-center justify-center
            ">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            </>
                        )}
                        {data?.role === "MENTALHEALTH" && (
                            <>
                                <li><Link href="/mentalhealth/appointment" className="hover:underline">ปฏิทินการนัดพบ</Link></li>
                                <li><Link href="/mentalhealth/appointment-check" className="hover:underline">การนัดหมายจากผู้ใช้บริการ</Link></li>
                                <li><Link href="/mentalhealth/evaluations" className="hover:underline">ประวัติการทำแบบประเมิน</Link></li>
                                <li><Link href="/mentalhealth/close-day" className="hover:underline">ตั้งค่าวันปิดให้บริการ</Link></li>
                                <li><Link href="/mentalhealth/history" className="hover:underline">ประวัติผู้ใช้บริการ</Link></li>
                                <li className="relative">
                                    <Link href="/mentalhealth/notifications">
                                        <Bell />
                                        {unreadCount > 0 && (
                                            <span className="
                absolute -top-1 -right-1
                bg-red-500 text-white text-xs
                rounded-full w-5 h-5
                flex items-center justify-center
            ">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </li>
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
                                                <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">แก้ไขโปรไฟล์</Link>
                                            </li>
                                            <li>
                                                <Link href="/changepassword" className="block px-4 py-2 hover:bg-gray-100">เปลี่ยนรหัสผ่าน</Link>
                                            </li>
                                            <li>
                                                <Link href="/reportproblem" className="block px-4 py-2 hover:bg-gray-100">รายงานปัญหา</Link>
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
                                <Link href="/mentalhealth/appointment-check" className="block hover:underline">การนัดหมายจากผู้ใช้บริการ</Link>
                                <Link href="/mentalhealth/evaluations" className="block hover:underline">ประวัติการทำแบบประเมิน</Link>
                                <Link href="/mentalhealth/evaluations" className="block hover:underline">ตั้งค่าวันปิดให้บริการ</Link>
                                <Link href="/mentalhealth/history" className="block hover:underline">ประวัติผู้ใช้บริการ</Link>
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
                                        <Link href="/profile" className="block hover:underline">แก้ไขโปรไฟล์</Link>
                                        <Link href="/changepassword" className="block hover:underline">เปลี่ยนรหัสผ่าน</Link>
                                        <Link href="/reportproblem" className="block hover:underline">รายงานปัญหา</Link>
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
