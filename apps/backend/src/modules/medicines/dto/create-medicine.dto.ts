import { Transform } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateMedicineDto {
  @IsString()
  sku!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  stock!: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0)
  price!: number;
}

