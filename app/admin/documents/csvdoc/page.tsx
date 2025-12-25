"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Document = {
    id: number;
    content: string;
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // modal state
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await fetch("/api/upload");
        const data = await res.json();
        setDocs(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm("ต้องการลบข้อมูลนี้หรือไม่")) return;

        await fetch(`/api/upload/${id}`, {
            method: "DELETE",
        });

        loadData();
    };

    const openEditModal = (doc: Document) => {
        setEditingDoc(doc);
        setEditContent(doc.content);
    };

    const closeEditModal = () => {
        setEditingDoc(null);
        setEditContent("");
    };

    const handleSaveEdit = async () => {
        if (!editingDoc) return;

        setSaving(true);

        await fetch(`/api/upload/${editingDoc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editContent }),
        });

        setSaving(false);
        closeEditModal();
        loadData();
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">แสดงข้อมูล CSV</h1>
                <Link
                    href="/admin/documents/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Upload CSV
                </Link>
            </div>

            {loading ? (
                <p>กำลังโหลดข้อมูล...</p>
            ) : (
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 w-20">ID</th>
                            <th className="border p-2">Content (preview)</th>
                            <th className="border p-2 w-32">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {docs.map((doc) => (
                            <tr key={doc.id}>
                                <td className="border p-2 text-center">{doc.id}</td>
                                <td className="border p-2">
                                    {doc.content.slice(0, 200)}...
                                </td>
                                <td className="border p-2 text-center space-x-2">
                                    <button
                                        onClick={() => openEditModal(doc)}
                                        className="text-blue-600"
                                    >
                                        แก้ไข
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="text-red-600"
                                    >
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ===== Modal แก้ไข ===== */}
            {editingDoc && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold">
                            แก้ไข Document #{editingDoc.id}
                        </h2>

                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={10}
                            className="w-full border p-2"
                        />

                        <p className="text-sm text-gray-500">
                            การบันทึกจะสร้าง embedding ใหม่อัตโนมัติ
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeEditModal}
                                className="px-4 py-2 border rounded"
                                disabled={saving}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={saving}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                {saving ? "กำลังบันทึก..." : "บันทึก"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
