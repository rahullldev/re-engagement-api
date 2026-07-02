import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting seed...");

    const result = await prisma.user.createMany({
        data: [
            {
                email: "imrahul2023+day2@gmail.com",
                lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                email: "imrahul2023+day5@gmail.com",
                lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                email: "imrahul2023+day7@gmail.com",
                lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
            {
                email: "imrahul2023+test@gmail.com",
                lastActivity: new Date(),
            },
        ],
    });

    console.log(`Inserted ${result.count} users`);
}

main()
    .then(async () => {
        console.log("✅ Seed completed");
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seed failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });