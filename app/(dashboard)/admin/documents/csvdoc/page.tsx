"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Document = {
    id: number;
    content: string;
};

export default function DocumentsPage() {
    const [docs, setDocs] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // pagination
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(1);

    // modal edit
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(
        async (pageNumber: number) => {
            setLoading(true);

            const res = await fetch(
                `/api/system/upload?page=${pageNumber}&limit=${limit}`
            );
            const json = await res.json();

            setDocs(json.data);
            setTotalPages(json.pagination.totalPages);
            setPage(json.pagination.page);

            setLoading(false);
        },
        [limit]
    );

    useEffect(() => {
        loadData(page);
    }, [page, loadData]);


    const handleDelete = async (id: number) => {
        if (!confirm("ต้องการลบข้อมูลนี้หรือไม่")) return;

        await fetch(`/api/system/upload/${id}`, {
            method: "DELETE",
        });

        loadData(page);
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

        await fetch(`/api/system/upload/${editingDoc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editContent }),
        });

        setSaving(false);
        closeEditModal();
        loadData(page);
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">แสดงข้อมูล CSV</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            window.location.href =
                            "/api/system/documents/export/pdf"
                        }
                        className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Export PDF
                    </button>

                    <button
                        onClick={() =>
                            window.location.href =
                            "/api/system/documents/export"
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Export CSV
                    </button>

                    <Link
                        href="/admin/documents/upload"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Upload CSV
                    </Link>

                    <button
                        onClick={async () => {
                            if (
                                !confirm(
                                    "⚠️ ต้องการลบ documents ทั้งหมดจริงหรือไม่?"
                                )
                            )
                                return;

                            await fetch("/api/system/documents/clear", {
                                method: "DELETE",
                            });

                            alert("ลบข้อมูลทั้งหมดแล้ว");
                            location.reload();
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        ลบเอกสารทั้งหมด
                    </button>
                </div>
            </div>

            {loading ? (
                <p>กำลังโหลดข้อมูล...</p>
            ) : (
                <>
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 w-20">ID</th>
                                <th className="border p-2">
                                    Content (preview)
                                </th>
                                <th className="border p-2 w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docs.map((doc) => (
                                <tr key={doc.id}>
                                    <td className="border p-2 text-center">
                                        {doc.id}
                                    </td>
                                    <td className="border p-2">
                                        {doc.content.slice(0, 200)}...
                                    </td>
                                    <td className="border p-2 text-center space-x-2">
                                        <button
                                            onClick={() =>
                                                openEditModal(doc)
                                            }
                                            className="text-blue-600"
                                        >
                                            แก้ไข
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(doc.id)
                                            }
                                            className="text-red-600"
                                        >
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            ก่อนหน้า
                        </button>

                        <span>
                            หน้า {page} / {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                        >
                            ถัดไป
                        </button>
                    </div>
                </>
            )}

            {/* Modal Edit */}
            {editingDoc && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold">
                            แก้ไข Document #{editingDoc.id}
                        </h2>

                        <textarea
                            value={editContent}
                            onChange={(e) =>
                                setEditContent(e.target.value)
                            }
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
