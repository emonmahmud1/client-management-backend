import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@gmail.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Create Super Admin User if it doesn't exist
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        status: 'ACTIVE',
        isVerified: true
      },
    });
    console.log(`Created super admin user: ${superAdmin.email}`);
  } else {
    console.log('Super admin user already exists, skipping seed.');
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
