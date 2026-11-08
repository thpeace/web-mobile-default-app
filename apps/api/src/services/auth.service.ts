import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@app/db';
import { LoginDto, AuthResponse, User } from '@app/types';
import { checkDbConnection, memoryStore } from './store';
import { JwtPayload } from '../middlewares/auth.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'cross_platform_super_secret_jwt_key_2026';

export class AuthService {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const user = await prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role as any,
        name: user.name,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const safeUser: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return { user: safeUser, token };
    } else {
      const user = memoryStore.users.find(
        (u) => u.email.toLowerCase() === dto.email.toLowerCase()
      );

      if (!user || !user.isActive) {
        throw new Error('Invalid email or password');
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

      const { password, ...safeUser } = user;
      return { user: safeUser, token };
    }
  }

  async getProfile(userId: string): Promise<User> {
    const isDb = await checkDbConnection();

    if (isDb) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new Error('User not found');
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } else {
      const user = memoryStore.users.find((u) => u.id === userId);
      if (!user) throw new Error('User not found');
      const { password, ...safeUser } = user;
      return safeUser;
    }
  }
}

export const authService = new AuthService();

