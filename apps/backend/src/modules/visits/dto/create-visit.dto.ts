import { IsOptional, IsString } from "class-validator";

export class CreateVisitDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsOptional()
  @IsString()
  complaint?: string;
}

