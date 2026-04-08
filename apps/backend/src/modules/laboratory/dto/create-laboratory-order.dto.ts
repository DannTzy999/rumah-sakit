import { IsOptional, IsString } from "class-validator";

export class CreateLaboratoryOrderDto {
  @IsString()
  visitId!: string;

  @IsString()
  doctorId!: string;

  @IsString()
  testType!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
