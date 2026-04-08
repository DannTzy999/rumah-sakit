import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from "class-validator";

export class InvoiceItemDto {
  @IsString()
  name!: string;

  @IsInt()
  @Min(1)
  qty!: number;

  @IsInt()
  @Min(0)
  price!: number;
}

export class CreateInvoiceDto {
  @IsString()
  visitId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items?: InvoiceItemDto[];
}

