import { hashSync } from "bcrypt";
import { prisma } from "../utils/database";
import { hashedPassword } from "../utils/auth";
import { getSampleCameras } from "../utils/sampleData";


async function main(): Promise<void> {
    console.log('starting database seeding...');
    try {
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'secret';

        console.log(`Creating admin user: ${adminUsername}`);

        const existingAdmin = await prisma.user.findUnique({
            where: { username: adminUsername }
        });

        if (existingAdmin) {
            console.log(`Admin user ${adminUsername} Skipping seeding.`);
            console.log(`User ID: ${existingAdmin.id}`);
            return;
        }
        console.log('hashing password...');
        const hashPassword = await hashedPassword(adminPassword);

        const admin = await prisma.user.create({
            data: {
                username: adminUsername,
                password: hashPassword,
            }
        });


        console.log(`Admin user created successfully!`);
        console.log(`Username: ${admin.username}`);
        console.log(`Password: ${adminPassword}`);
        console.log(`User ID: ${admin.id}`);

        // Create some sample cameras for testing
        console.log('📷 Creating sample cameras...');

        for (const cameraData of getSampleCameras(admin.id)) {
            const camera = await prisma.camera.create({
                data: cameraData
            });
            console.log(`📷 Created camera: ${camera.name} (${camera.enabled ? 'enabled' : 'disabled'})`);
        }

        console.log('Database seeding completed successfully!');        


    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
}


main().catch((e) => {
    console.error('Seeding failed:');
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
    console.log('📦 Database connection closed');
});