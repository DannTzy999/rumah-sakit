import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePatientDto {
  @IsString()
  mrn!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}

