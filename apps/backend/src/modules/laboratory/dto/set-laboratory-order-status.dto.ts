import { IsIn } from "class-validator";

export class SetLaboratoryOrderStatusDto {
  @IsIn(["MENUNGGU", "PROSES", "SELESAI", "BATAL"])
  status!: "MENUNGGU" | "PROSES" | "SELESAI" | "BATAL";
}
