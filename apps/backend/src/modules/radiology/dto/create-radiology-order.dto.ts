import { IsOptional, IsString } from "class-validator";

export class CreateRadiologyOrderDto {
  @IsString()
  visitId!: string;

  @IsString()
  doctorId!: string;

  @IsString()
  examType!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
