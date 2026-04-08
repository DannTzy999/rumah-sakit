import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { RadiologyController } from "./radiology.controller";
import { RadiologyService } from "./radiology.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [RadiologyController],
  providers: [RadiologyService],
  exports: [RadiologyService]
})
export class RadiologyModule {}
