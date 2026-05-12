import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload as JsonWebTokenPayload, verify } from 'jsonwebtoken';
import { AuthUser } from './auth.types';

function parseAuthUser(payload: string | JsonWebTokenPayload): AuthUser | null {
  if (typeof payload === 'string') {
    return null;
  }

  const role = payload.role;
  const sub = payload.sub;
  const candidateId = payload.candidateId;
  const normalizedSub = typeof sub === 'number' ? sub : Number(sub);

  if (!Number.isFinite(normalizedSub)) {
    return null;
  }

  if (role !== 'admin' && role !== 'candidate') {
    return null;
  }

  if (candidateId !== undefined && typeof candidateId !== 'number') {
    return null;
  }

  return {
    sub: normalizedSub,
    role,
    candidateId,
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const secret = this.configService.get<string>('JWT_SECRET', 'change-me');

    try {
      const decoded = verify(token, secret);
      const user = parseAuthUser(decoded);
      if (!user) {
        throw new UnauthorizedException('Invalid token payload');
      }

      request.user = user;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
