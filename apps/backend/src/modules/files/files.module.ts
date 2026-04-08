import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";

import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}

