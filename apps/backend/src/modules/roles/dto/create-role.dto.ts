import { IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsOptional()
  description?: string;
}

