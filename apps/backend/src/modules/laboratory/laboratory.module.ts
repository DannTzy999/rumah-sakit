import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { LaboratoryController } from "./laboratory.controller";
import { LaboratoryService } from "./laboratory.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [LaboratoryController],
  providers: [LaboratoryService],
  exports: [LaboratoryService]
})
export class LaboratoryModule {}
