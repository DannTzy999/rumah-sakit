import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  patientId!: string;

  @IsString()
  doctorId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

