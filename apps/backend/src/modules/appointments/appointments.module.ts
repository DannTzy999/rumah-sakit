import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService]
})
export class AppointmentsModule {}

