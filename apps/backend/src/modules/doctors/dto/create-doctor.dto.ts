import { IsOptional, IsString } from "class-validator";

export class CreateDoctorDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

