import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RequirePermissions } from "../../common/auth/permissions.decorator";
import { PermissionsGuard } from "../../common/auth/permissions.guard";
import { PaginationQueryDto } from "../../common/pagination/pagination";

import { AuditLogsService } from "./audit-logs.service";

@ApiTags("audit-logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly audit: AuditLogsService) {}

  @RequirePermissions("audit.read")
  @Get()
  async list(@Query() query: PaginationQueryDto) {
    const result = await this.audit.list(query);
    return { success: true, data: result.data, meta: result.meta };
  }
}

