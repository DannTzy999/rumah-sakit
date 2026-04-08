import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateQueueEntryDto {
  @IsString()
  patientId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsDateString()
  date!: string;
}

