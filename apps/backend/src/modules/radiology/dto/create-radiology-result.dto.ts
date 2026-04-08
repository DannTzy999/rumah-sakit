import { IsOptional, IsString } from "class-validator";

export class CreateRadiologyResultDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  impression?: string;

  @IsOptional()
  @IsString()
  filePath?: string;
}
