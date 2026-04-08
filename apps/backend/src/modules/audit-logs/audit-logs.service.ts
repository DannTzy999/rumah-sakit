import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PaginationQueryDto, toSkipTake } from "../../common/pagination/pagination";
import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PaginationQueryDto) {
    const { skip, take, page, limit } = toSkipTake(query.page, query.limit);
    const [total, data] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, email: true, name: true } } }
      })
    ]);
    return { data, meta: { page, limit, total } };
  }

  create(input: {
    action: string;
    entity: string;
    entityId?: string;
    actorId?: string;
    ip?: string;
    userAgent?: string;
    metadata?: unknown;
  }) {
    return this.prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        actorId: input.actorId,
        ip: input.ip,
        userAgent: input.userAgent,
        metadata: input.metadata as Prisma.InputJsonValue | undefined
      }
    });
  }
}

