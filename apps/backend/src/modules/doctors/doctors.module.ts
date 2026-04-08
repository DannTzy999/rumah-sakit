import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { DoctorsController } from "./doctors.controller";
import { DoctorsService } from "./doctors.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService]
})
export class DoctorsModule {}

