import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../shared/prisma/prisma.service";

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.permission.findMany({ orderBy: { key: "asc" } });
  }
}

