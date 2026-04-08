import { IsIn } from "class-validator";

export class SetRadiologyOrderStatusDto {
  @IsIn(["MENUNGGU", "PROSES", "SELESAI", "BATAL"])
  status!: "MENUNGGU" | "PROSES" | "SELESAI" | "BATAL";
}
