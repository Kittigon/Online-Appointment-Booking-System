import { NextResponse } from "next/server";
import prisma from "@/utils/db";

export async function GET() {
    try {
        const userCount = await prisma.users.count();
        const reportCount = await prisma.reportproblems.count();
        const assessmentCount = await prisma.dass_21_result.count();

        // -----------------------------
        // 4️⃣ Recent Alerts
        //    - ล่าสุด 5 จาก reportProblem
        //    - ล่าสุด 5 จาก dass_21_result
        // -----------------------------
        const recentReportAlertsRaw = await prisma.reportproblems.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { name: true } } },
        });

        const recentAssessmentAlertsRaw = await prisma.dass_21_result.findMany({
            orderBy: { created_at: "desc" },
            take: 5,
        });

        const recentReportAlerts = recentReportAlertsRaw.map(r => ({
            id: r.id,
            message: `${r.user?.name}: แจ้งปัญหา "${r.type}"`,
            createdAt: r.createdAt
        }));

        const recentAssessmentAlerts = recentAssessmentAlertsRaw.map(r => ({
            id: r.id,
            message: `ผู้ใช้ ${r.user_id} ทำแบบประเมิน - สภาวะซึมเศร้า: ${r.depression_level}, สภาวะวิตกกังวล: ${r.anxiety_level}, สภาวะเครียด: ${r.stress_level}`,
            createdAt: r.created_at
        }));

        const riskAlertCount = await prisma.dass_21_result.count({
            where: {
                OR: [
                    { depression_score: { gte: 11 } },
                    { anxiety_score: { gte: 8 } },
                    { stress_score: { gte: 13 } },
                ],
            },
        });

        return NextResponse.json({
            userCount,
            reportCount,
            assessmentCount,
            riskAlertCount,
            recentAlerts: [...recentReportAlerts, ...recentAssessmentAlerts].sort(
                (a, b) => {
                    const aTime = a.createdAt ? a.createdAt.getTime() : 0;
                    const bTime = b.createdAt ? b.createdAt.getTime() : 0;
                    return bTime - aTime;
                }
            ).slice(0, 5) // รวมกันแล้วเอา 5 ล่าสุด
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { message: "Error fetching dashboard data" },
            { status: 500 }
        );
    }
}
