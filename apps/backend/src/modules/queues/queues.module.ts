import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { QueuesController } from "./queues.controller";
import { QueuesService } from "./queues.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [QueuesController],
  providers: [QueuesService],
  exports: [QueuesService]
})
export class QueuesModule {}

