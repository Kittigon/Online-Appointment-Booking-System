const { PrismaClient, HolidayType } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
    const year = new Date().getFullYear()

    const holidays = [
        { date: `${year}-01-01`, name: "วันขึ้นปีใหม่", type: HolidayType.NATIONAL },
        { date: `${year}-01-02`, name: "วันหยุดพิเศษช่วงปีใหม่", type: HolidayType.SPECIAL },
        { date: `${year}-03-03`, name: "วันมาฆบูชา", type: HolidayType.RELIGIOUS },
        { date: `${year}-04-06`, name: "วันจักรี", type: HolidayType.NATIONAL },
        { date: `${year}-04-13`, name: "วันสงกรานต์ (วันผู้สูงอายุ)", type: HolidayType.NATIONAL },
        { date: `${year}-04-14`, name: "วันสงกรานต์ (วันครอบครัว)", type: HolidayType.NATIONAL },
        { date: `${year}-04-15`, name: "วันสงกรานต์ (วันเถลิงศก)", type: HolidayType.NATIONAL },
        { date: `${year}-05-01`, name: "วันแรงงานแห่งชาติ", type: HolidayType.NATIONAL },
        { date: `${year}-05-04`, name: "วันฉัตรมงคล", type: HolidayType.NATIONAL },
        { date: `${year}-05-11`, name: "วันพระราชพิธีพืชมงคลจรดพระนังคัลแรกนาขวัญ", type: HolidayType.SPECIAL },
        { date: `${year}-05-31`, name: "วันวิสาขบูชา", type: HolidayType.RELIGIOUS },
        { date: `${year}-06-01`, name: "วันชดเชยวิสาขบูชา", type: HolidayType.SPECIAL },
        { date: `${year}-06-03`, name: "วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ พระบรมราชินี", type: HolidayType.NATIONAL },
        { date: `${year}-07-28`, name: "วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระเจ้าอยู่หัว", type: HolidayType.NATIONAL },
        { date: `${year}-07-29`, name: "วันอาสาฬหบูชา", type: HolidayType.RELIGIOUS },
        { date: `${year}-07-30`, name: "วันเข้าพรรษา", type: HolidayType.RELIGIOUS },
        { date: `${year}-08-12`, name: "วันแม่แห่งชาติ", type: HolidayType.NATIONAL },
        { date: `${year}-10-13`, name: "วันนวมินทรมหาราช", type: HolidayType.NATIONAL },
        { date: `${year}-10-23`, name: "วันปิยมหาราช", type: HolidayType.NATIONAL },
        { date: `${year}-12-05`, name: "วันพ่อแห่งชาติ", type: HolidayType.NATIONAL },
        { date: `${year}-12-07`, name: "วันชดเชยวันพ่อแห่งชาติ", type: HolidayType.SPECIAL },
        { date: `${year}-12-10`, name: "วันรัฐธรรมนูญ", type: HolidayType.NATIONAL },
        { date: `${year}-12-31`, name: "วันสิ้นปี", type: HolidayType.NATIONAL }
    ]

    for (const h of holidays) {
        await prisma.holiday.upsert({
            where: { date: h.date },
            update: {
                name: h.name,
                type: h.type
            },
            create: h
        })
    }
}

main()
    .then(() => {
        console.log(" Holiday seeded successfully")
    })
    .catch((err) => {
        console.error(" Seed failed:", err)
    })
    .finally(() => {
        prisma.$disconnect()
    })
