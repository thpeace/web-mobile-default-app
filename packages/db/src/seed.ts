import { PrismaClient, Role, RequestStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seed() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Alex Admin',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Create Employees
  const employee1 = await prisma.user.create({
    data: {
      email: 'employee@example.com',
      password: hashedPassword,
      name: 'Emma Employee',
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'john.tech@example.com',
      password: hashedPassword,
      name: 'John Technician',
      role: Role.EMPLOYEE,
      isActive: true,
    },
  });

  // 3. Create Clients
  const client1 = await prisma.user.create({
    data: {
      email: 'client@example.com',
      password: hashedPassword,
      name: 'Charlie Client',
      role: Role.CLIENT,
      isActive: true,
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'acme.corp@example.com',
      password: hashedPassword,
      name: 'Acme Corp Ltd',
      role: Role.CLIENT,
      isActive: true,
    },
  });

  console.log('✅ Created users:');
  console.log('   - Admin: admin@example.com / password123');
  console.log('   - Employee: employee@example.com / password123');
  console.log('   - Employee: john.tech@example.com / password123');
  console.log('   - Client: client@example.com / password123');
  console.log('   - Client: acme.corp@example.com / password123');

  // 4. Create Initial Requests
  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  await prisma.request.createMany({
    data: [
      {
        title: 'Network printer connection failure in finance dept',
        description: 'The HP LaserJet on the 3rd floor is unreachable via network IP.',
        status: RequestStatus.PENDING,
        clientId: client1.id,
        createdAt: twoHoursAgo,
        updatedAt: twoHoursAgo,
      },
      {
        title: 'Request cloud server upgrade for staging environment',
        description: 'Need additional 32GB RAM and 4 vCPUs allocated to staging cluster.',
        status: RequestStatus.IN_PROGRESS,
        clientId: client1.id,
        employeeId: employee1.id,
        createdAt: oneDayAgo,
        updatedAt: now,
      },
      {
        title: 'Fix SSL certificate expiration on customer portal',
        description: 'Wildcard certificate renewed and verified in production reverse proxy.',
        status: RequestStatus.RESOLVED,
        clientId: client2.id,
        employeeId: employee1.id,
        createdAt: threeDaysAgo,
        updatedAt: twoHoursAgo,
        resolvedAt: twoHoursAgo,
      },
      {
        title: 'VPN access configuration for remote engineering team',
        description: 'Configure WireGuard profiles and 2FA credentials.',
        status: RequestStatus.IN_PROGRESS,
        clientId: client2.id,
        employeeId: employee2.id,
        createdAt: oneDayAgo,
        updatedAt: now,
      },
      {
        title: 'Obsolete legacy hardware disposal request',
        description: 'Duplicate request already processed via ticket #1042.',
        status: RequestStatus.CANCELLED,
        clientId: client1.id,
        createdAt: threeDaysAgo,
        updatedAt: threeDaysAgo,
      },
    ],
  });

  console.log('✅ Created sample requests.');
  console.log('✨ Seeding finished successfully.');
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

