import { prisma } from '@app/db';
import { User, RequestItem, Role, RequestStatus } from '@app/types';
import bcrypt from 'bcryptjs';

// In-memory fallback dataset mirroring the seed data
let isDbConnected: boolean | null = null;

export async function checkDbConnection(): Promise<boolean> {
  if (isDbConnected !== null) return isDbConnected;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    console.log('✅ Connected to PostgreSQL database via Prisma');
    return true;
  } catch (err) {
    isDbConnected = false;
    console.warn('⚠️  PostgreSQL connection unavailable. Operating in high-fidelity in-memory storage mode.');
    return false;
  }
}

// In-memory entities
export interface UserRecord extends User {
  password: string;
}

const defaultHashedPassword = bcrypt.hashSync('password123', 10);

const memoryUsers: UserRecord[] = [
  {
    id: 'u-admin-1',
    email: 'admin@example.com',
    password: defaultHashedPassword,
    name: 'Alex Admin',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  },
  {
    id: 'u-emp-1',
    email: 'employee@example.com',
    password: defaultHashedPassword,
    name: 'Emma Employee',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: new Date('2026-01-05T00:00:00Z'),
    updatedAt: new Date('2026-01-05T00:00:00Z'),
  },
  {
    id: 'u-emp-2',
    email: 'john.tech@example.com',
    password: defaultHashedPassword,
    name: 'John Technician',
    role: 'EMPLOYEE',
    isActive: true,
    createdAt: new Date('2026-01-10T00:00:00Z'),
    updatedAt: new Date('2026-01-10T00:00:00Z'),
  },
  {
    id: 'u-client-1',
    email: 'client@example.com',
    password: defaultHashedPassword,
    name: 'Charlie Client',
    role: 'CLIENT',
    isActive: true,
    createdAt: new Date('2026-01-15T00:00:00Z'),
    updatedAt: new Date('2026-01-15T00:00:00Z'),
  },
  {
    id: 'u-client-2',
    email: 'acme.corp@example.com',
    password: defaultHashedPassword,
    name: 'Acme Corp Ltd',
    role: 'CLIENT',
    isActive: true,
    createdAt: new Date('2026-01-20T00:00:00Z'),
    updatedAt: new Date('2026-01-20T00:00:00Z'),
  },
];

const now = new Date();
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

const memoryRequests: RequestItem[] = [
  {
    id: 'req-1',
    title: 'Network printer connection failure in finance dept',
    description: 'The HP LaserJet on the 3rd floor is unreachable via network IP.',
    status: 'PENDING',
    clientId: 'u-client-1',
    employeeId: null,
    createdAt: twoHoursAgo,
    updatedAt: twoHoursAgo,
    resolvedAt: null,
  },
  {
    id: 'req-2',
    title: 'Request cloud server upgrade for staging environment',
    description: 'Need additional 32GB RAM and 4 vCPUs allocated to staging cluster.',
    status: 'IN_PROGRESS',
    clientId: 'u-client-1',
    employeeId: 'u-emp-1',
    createdAt: oneDayAgo,
    updatedAt: now,
    resolvedAt: null,
  },
  {
    id: 'req-3',
    title: 'Fix SSL certificate expiration on customer portal',
    description: 'Wildcard certificate renewed and verified in production reverse proxy.',
    status: 'RESOLVED',
    clientId: 'u-client-2',
    employeeId: 'u-emp-1',
    createdAt: threeDaysAgo,
    updatedAt: twoHoursAgo,
    resolvedAt: twoHoursAgo,
  },
  {
    id: 'req-4',
    title: 'VPN access configuration for remote engineering team',
    description: 'Configure WireGuard profiles and 2FA credentials.',
    status: 'IN_PROGRESS',
    clientId: 'u-client-2',
    employeeId: 'u-emp-2',
    createdAt: oneDayAgo,
    updatedAt: now,
    resolvedAt: null,
  },
  {
    id: 'req-5',
    title: 'Obsolete legacy hardware disposal request',
    description: 'Hardware safely degaussed and recycled under compliance standard.',
    status: 'RESOLVED',
    clientId: 'u-client-1',
    employeeId: 'u-emp-2',
    createdAt: fiveDaysAgo,
    updatedAt: threeDaysAgo,
    resolvedAt: threeDaysAgo,
  },
];

export const memoryStore = {
  users: memoryUsers,
  requests: memoryRequests,
};

