'use client'

import { useState, useEffect } from "react"
import type { appointments } from "@prisma/client"
import { Calendar, Clock, User, Phone } from "lucide-react"

const AdminAppointment = () => {
    const [appointments, setAppointments] = useState<appointments[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await fetch('/api/appointments')
            if (res.ok) {
                const data = await res.json()
                setAppointments(data.showAppoinment)
            }
        } catch (error) {
            console.error('Error fetching appointments:', error)
        }
    }

    // Pagination
    const totalPages = Math.ceil(appointments.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentData = appointments.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-6">การนัดหมายทั้งหมด</h2>

            {appointments.length === 0 ? (
                <p className="text-slate-500">ยังไม่มีการนัดหมาย</p>
            ) : (
                <>
                    {/*  Card Layout ทุกหน้าจอ */}
                    <div className="grid gap-4">
                        {currentData.map((appt) => (
                            <div key={appt.id} 
                            className="flex flex-col md:flex-row md:justify-between lg:flex-row lg:justify-between 
            p-5 rounded-xl border shadow-sm bg-white">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-slate-800 font-medium">
                                        <User className="w-5 h-5 text-purple-600" /> {appt.name}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                                        <Calendar className="w-5 h-5 text-green-600" />{" "}
                                        {new Date(appt.date).toLocaleDateString("th-TH")}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                                        <Clock className="w-5 h-5 text-blue-600" /> {appt.time}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 text-slate-700">
                                        <Phone className="w-5 h-5 text-orange-600" /> {appt.phone}
                                    </div>
                                </div>
                                <div>
                                    <span
                                        className={`mt-3 inline-block px-3 py-1 text-sm rounded-full font-medium
                    ${appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : ''}
                    ${appt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                `}
                                    >
                                        {appt.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="px-3 py-1 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
                        >
                            ก่อนหน้า
                        </button>
                        <span className="px-2 text-slate-700">
                            หน้า {currentPage} / {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="px-3 py-1 rounded-lg border bg-white hover:bg-slate-100 disabled:opacity-40"
                        >
                            ถัดไป
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminAppointment
