'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { changePasswordSchema } from '@/schemas/changePassword';

type User = {
    id: number;
    email: string;
    name: string;
    role: "USER" | "MENTALHEALTH" | "ADMIN";
};

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<User | null>(null);

    // ===== Loading State =====
    const [loading, setLoading] = useState(true);       // โหลดข้อมูลผู้ใช้
    const [submitting, setSubmitting] = useState(false); // ตอนกด submit

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/token', {
                method: 'GET',
                credentials: 'include',
            });

            const result = await res.json();

            if (res.ok && result.user) {
                setData(result.user);
            }
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error);
            toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (submitting) return;

        const parsed = changePasswordSchema.safeParse({
            currentPassword,
            newPassword,
            confirmNewPassword,
        });

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors;
            setError(
                errors.currentPassword?.[0] ||
                errors.newPassword?.[0] ||
                errors.confirmNewPassword?.[0] ||
                'ข้อมูลไม่ถูกต้อง'
            );
            return;
        }

        if (!data?.id) {
            setError('ไม่พบข้อมูลผู้ใช้');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`/api/user/${data.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed.data),
            });

            const result = await res.json();

            if (!res.ok) {
                toast.error(result.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
                return;
            }

            toast.success('เปลี่ยนรหัสผ่านสำเร็จ');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error(error);
            toast.error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <>
                <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">เปลี่ยนรหัสผ่าน</h2>

                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center text-gray-400">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-3"></div>
                        <p>กำลังโหลดข้อมูล...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <h2 className="text-3xl font-bold text-slate-800 pt-6 pl-6 mt-3 ml-2">เปลี่ยนรหัสผ่าน</h2>

            <main className="flex items-center justify-center px-4 py-10">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2">
                    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 text-purple-500 p-10">
                        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
                        <p className="text-lg">ตั้งรหัสผ่านใหม่เพื่อความปลอดภัยของคุณ</p>
                    </div>

                    <div className="p-8">
                        <h2 className="text-2xl font-semibold text-center text-purple-600 mb-6">
                            เปลี่ยนรหัสผ่าน
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    รหัสผ่านเดิม
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    รหัสผ่านใหม่
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    ยืนยันรหัสผ่านใหม่
                                </label>
                                <input
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="mt-1 p-2 block w-full rounded-xl border-gray-300 shadow-sm"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-2 rounded-xl text-white transition flex items-center justify-center gap-2
                                    ${submitting
                                        ? 'bg-purple-400 cursor-not-allowed'
                                        : 'bg-purple-500 hover:bg-purple-600'
                                    }`}
                            >
                                {submitting && (
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                )}
                                {submitting ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}
