import { NextResponse } from "next/server";
import prisma from "@/utils/db";
import { getCache, setCache } from "@/utils/cache";

export async function GET() {
    try {
        const cacheKey = 'dashboard:admin';

        const cached = await getCache(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        const userCount = await prisma.users.count();
        const reportCount = await prisma.reportproblems.count();
        const assessmentCount = await prisma.dass_21_result.count();

        // -----------------------------
        // Recent Alerts
        //    - ล่าสุด 5 จาก reportProblem
        //    - ล่าสุด 5 จาก dass_21_result
        // -----------------------------

        // การรายงงานปัญหาของผู้ใช้ (ล่าสุด 5 รายการ)
        const recentReportAlertsRaw = await prisma.reportproblems.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { user: { select: { name: true } } },
        });

        // การทำแบบประเมินของผู้ใช้ (ล่าสุด 5 รายการ)
        const recentAssessmentAlertsRaw = await prisma.dass_21_result.findMany({
            orderBy: { created_at: "desc" },
            take: 5,
            include: {
                user_consent: {
                    select: {
                        name: true,
                        phone: true,
                        student_id: true
                    }
                }
            }
        });

        const recentReportAlerts = recentReportAlertsRaw.map(r => ({
            id: r.id,
            message: `${r.user?.name}: แจ้งปัญหา "${r.type}"`,
            createdAt: r.createdAt
        }));

        const recentAssessmentAlerts = recentAssessmentAlertsRaw.map(r => ({
            id: r.id,
            message: `${r.user_consent?.name} (${r.user_consent?.student_id}) ทำแบบประเมิน 
            - ซึมเศร้า: ${r.depression_level}, วิตกกังวล: ${r.anxiety_level}, เครียด: ${r.stress_level}`,
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

        const result = {
            userCount,
            reportCount,
            assessmentCount,
            riskAlertCount,
            recentAlerts: [...recentReportAlerts, ...recentAssessmentAlerts]
                .sort((a, b) => {
                    const aTime = a.createdAt?.getTime() ?? 0;
                    const bTime = b.createdAt?.getTime() ?? 0;
                    return bTime - aTime;
                })
                .slice(0, 5),
        };

        // เขียน cache (เช่น 60 วินาที)
        await setCache(cacheKey, result, 60);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Dashboard API Error:", error);
        return NextResponse.json(
            { message: "Error fetching dashboard data" },
            { status: 500 }
        );
    }
}
