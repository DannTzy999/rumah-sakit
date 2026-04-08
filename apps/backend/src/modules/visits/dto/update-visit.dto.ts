import { PartialType } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

import { CreateVisitDto } from "./create-visit.dto";

export class UpdateVisitDto extends PartialType(CreateVisitDto) {
	@IsOptional()
	@IsString()
	diagnosis?: string;

	@IsOptional()
	@IsDateString()
	endedAt?: string;
}

