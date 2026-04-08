import { IsOptional, IsString } from "class-validator";

export class CreateLaboratoryResultDto {
  @IsString()
  parameter!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  normalRange?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
