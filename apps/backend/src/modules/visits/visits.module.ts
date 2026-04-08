import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { VisitsController } from "./visits.controller";
import { VisitsService } from "./visits.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [VisitsController],
  providers: [VisitsService],
  exports: [VisitsService]
})
export class VisitsModule {}

