import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";

import { PrismaService } from "../../shared/prisma/prisma.service";

import type { JwtPayload } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  private async buildUserAuthState(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } }
            }
          }
        }
      }
    });
    if (!user) throw new UnauthorizedException("Invalid token");
    if (user.status !== "ACTIVE") throw new UnauthorizedException("User disabled");

    const roles = user.roles.map((r) => r.role.key);
    const permissions = Array.from(
      new Set(user.roles.flatMap((r) => r.role.permissions.map((rp) => rp.permission.key)))
    );

    return {
      user,
      roles,
      permissions,
      payload: { sub: user.id, email: user.email, roles, permissions } as JwtPayload
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.status !== "ACTIVE") throw new UnauthorizedException("User disabled");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Invalid credentials");

    const { payload, roles, permissions, user: authUser } = await this.buildUserAuthState(user.id);
    const accessTtl = Number(this.config.get("JWT_ACCESS_TTL_SECONDS", 900));
    const refreshTtl = Number(this.config.get("JWT_REFRESH_TTL_SECONDS", 604800));

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: accessTtl
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: refreshTtl
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        status: authUser.status,
        roles,
        permissions
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = (await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET")
      })) as JwtPayload;

      const { payload: nextPayload } = await this.buildUserAuthState(payload.sub);
      const accessTtl = Number(this.config.get("JWT_ACCESS_TTL_SECONDS", 900));
      const refreshTtl = Number(this.config.get("JWT_REFRESH_TTL_SECONDS", 604800));

      const accessToken = await this.jwt.signAsync(nextPayload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: accessTtl
      });
      const nextRefreshToken = await this.jwt.signAsync(nextPayload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: refreshTtl
      });

      return { accessToken, refreshToken: nextRefreshToken };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async me(userId: string) {
    const { user, roles, permissions } = await this.buildUserAuthState(userId);
    return { id: user.id, email: user.email, name: user.name, status: user.status, roles, permissions };
  }
}

