'use client'
import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminResetPasswordSchema } from '@/schemas/adminResetPassword';

type Users = {
    id: number;
    email: string;
    name: string;
    role: string;
    updateAt: Date;
}


// แปลงวันที่เป็นภาษาไทย
const formatThaiDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit',
        weekday: 'long'
    });
};

const AdminManage = () => {
    const [data, setData] = useState<Users[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`/api/user`)
            const data: { showuser: Users[] } = await res.json();
            setData(data.showuser)

        } catch (error) {
            console.log('เกิดข้อผิดพลาดในการโหลดข้อมูล:', error)
            toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล')
        }
    }


    const handleEdit = async () => {
        if (!selectedUserId) {
            toast.error('ไม่พบผู้ใช้ที่เลือก');
            return;
        }

        const parsed = adminResetPasswordSchema.safeParse({
            newPassword,
            confirmNewPassword,
        });

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            setError(
                errors.newPassword?.[0] ||
                errors.confirmNewPassword?.[0] ||
                'ข้อมูลไม่ถูกต้อง'
            );
            return;
        }

        setError(null);

        try {
            const res = await fetch(
                `/api/admin/reset-passwordUser/${selectedUserId}`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword }),
                }
            );

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
                return;
            }

            toast.success('รีเซ็ตรหัสผ่านสำเร็จ');

            setNewPassword('');
            setConfirmNewPassword('');
            setSelectedUserId(null);

            // ปิด modal
            (
                document.getElementById(
                    'change_password_modal'
                ) as HTMLDialogElement
            )?.close();
            
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาด');
        }
    };

    const openModal = (userId: number) => {
        setSelectedUserId(userId);
        setNewPassword('');
        setConfirmNewPassword('');
        setError(null);

        const modal = document.getElementById(
            'change_password_modal'
        ) as HTMLDialogElement | null;

        modal?.showModal();
    };

    const handleRemove = async (id: number) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ที่มี ID: ${id} ?`)) {
            return;
        }
        try {
            const res = await fetch(`/api/user/` + id, {
                method: "DELETE",
                headers: {
                    'Content-type': "application/json"
                }
            })

            if (res.ok) {
                toast.success('ลบผู้ใช้สำเร็จ !')
                fetchAppointments();
            }
        } catch (error) {
            console.log('เกิดข้อผิดพลาดในการลบข้อมูล : ', error)
            toast.error('เกิดข้อผิดพลาดในการลบข้อมูล')
        }
    }

    const handleRoleChange = async (id: number, newRole: string) => {
        try {
            const res = await fetch(`/api/user/role/` + id, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success("อัปเดตบทบาทผู้ใช้สำเร็จ!");
                fetchAppointments();
            }

        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการอัปเดตบทบาท: ", error);
            toast.error("เกิดข้อผิดพลาดในการอัปเดตบทบาท");
        }
    };


    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">จัดการผู้ใช้</h2>

            <div className="flex flex-col items-center justify-center mt-10 px-4 w-full">
                <div className="bg-white w-full  rounded-lg shadow-lg p-5 overflow-x-auto">
                    <table className="min-w-[900px] w-full text-left">
                        <thead>
                            <tr className=" text-gray-700 text-center bg-purple-100">
                                <th className="border-b-2 border-gray-300 p-2">ID</th>
                                <th className="border-b-2 border-gray-300 p-2">ชื่อ-นามสกุล</th>
                                <th className="border-b-2 border-gray-300 p-2">อีเมล</th>
                                <th className="border-b-2 border-gray-300 p-2">บทบาท</th>
                                <th className="border-b-2 border-gray-300 p-2">แก้ไขเมื่อ</th>
                                <th className="border-b-2 border-gray-300 p-2">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map(item => (
                                    <tr key={item.id} className="text-gray-700  text-center">
                                        <td className="border-b border-gray-200 p-2">{item.id}</td>
                                        <td className="border-b border-gray-200 p-2">{item.name}</td>
                                        <td className="border-b border-gray-200 p-2">{item.email}</td>
                                        <td className="border-b border-gray-200 p-2">
                                            <select
                                                className="border rounded-md px-2 py-1 outline-purple-500"
                                                value={item.role}
                                                onChange={(e) => handleRoleChange(item.id, e.target.value)}
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="MENTALHEALTH">MENTALHEALTH</option>
                                            </select>
                                        </td>

                                        <td className="border-b border-gray-200 p-2">
                                            {item.updateAt
                                                ? typeof item.updateAt === 'string'
                                                    ? formatThaiDate(item.updateAt)
                                                    : new Date(item.updateAt).toLocaleDateString('th-TH')
                                                : '-'}
                                        </td>
                                        <td className="border-b border-gray-200 p-2 flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openModal(item.id)}
                                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm shadow"
                                            >
                                                <Pencil size={16} /> แก้รหัสผ่าน
                                            </button>
                                            <button
                                                onClick={() => { handleRemove(item.id) }}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-700 px-3 py-1 rounded-md text-sm shadow">
                                                <Trash2 size={16} /> ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                {/* MODAL */}
                <dialog
                    id="change_password_modal"
                    className="modal [&::backdrop]:bg-transparent"
                >
                    <div className="modal-box max-w-md">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3">
                                ✕
                            </button>
                        </form>

                        <h3 className="font-bold text-lg text-purple-700 mb-4">
                            เปลี่ยนรหัสผ่านผู้ใช้งาน
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    รหัสผ่านใหม่
                                </label>
                                <input
                                    type="password"
                                    className="w-full border rounded-md px-3 py-2 outline-purple-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    ยืนยันรหัสผ่าน
                                </label>
                                <input
                                    type="password"
                                    className="w-full border rounded-md px-3 py-2 outline-purple-500"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                            </div>
                            {error && (
                                <div className="text-red-500 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            <button
                                onClick={handleEdit}
                                type="button"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold"
                            >
                                บันทึกการเปลี่ยนแปลง
                            </button>
                        </div>
                    </div>
                </dialog>

            </div>
        </>
    )
}
export default AdminManage