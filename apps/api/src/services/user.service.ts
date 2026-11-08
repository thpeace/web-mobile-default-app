import bcrypt from 'bcryptjs';
import { prisma } from '@app/db';
import { User, CreateUserDto, UpdateUserDto, Role } from '@app/types';
import { checkDbConnection, memoryStore, UserRecord } from './store';
import { randomUUID } from 'crypto';

export class UserService {
  async listUsers(search?: string, role?: string): Promise<User[]> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const where: any = {};
      if (role && ['ADMIN', 'EMPLOYEE', 'CLIENT'].includes(role.toUpperCase())) {
        where.role = role.toUpperCase();
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role as Role,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
    } else {
      let filtered = [...memoryStore.users];
      if (role) {
        filtered = filtered.filter((u) => u.role.toUpperCase() === role.toUpperCase());
      }
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
        );
      }
      return filtered.map(({ password, ...safe }) => safe);
    }
  }

  async getUserById(id: string): Promise<User> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) throw new Error('User not found');
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      const user = memoryStore.users.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      const { password, ...safe } = user;
      return safe;
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const isDb = await checkDbConnection();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    if (isDb) {
      const existing = await prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) {
        throw new Error('A user with this email address already exists');
      }

      const user = await prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          name: dto.name,
          role: dto.role as any,
          isActive: true,
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      const existing = memoryStore.users.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase()
      );
      if (existing) {
        throw new Error('A user with this email address already exists');
      }

      const newUser: UserRecord = {
        id: randomUUID(),
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: dto.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryStore.users.unshift(newUser);
      const { password, ...safe } = newUser;
      return safe;
    }
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const isDb = await checkDbConnection();
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email.toLowerCase();
    if (dto.role) updateData.role = dto.role;
    if (typeof dto.isActive === 'boolean') updateData.isActive = dto.isActive;
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (isDb) {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      const index = memoryStore.users.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found');

      const existing = memoryStore.users[index];
      const updated: UserRecord = {
        ...existing,
        ...updateData,
        updatedAt: new Date(),
      };
      memoryStore.users[index] = updated;

      const { password, ...safe } = updated;
      return safe;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const isDb = await checkDbConnection();

    if (isDb) {
      await prisma.user.delete({ where: { id } });
      return true;
    } else {
      const index = memoryStore.users.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found');
      memoryStore.users.splice(index, 1);
      return true;
    }
  }
}

export const userService = new UserService();
