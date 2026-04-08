import { IsIn } from "class-validator";

export class SetAppointmentStatusDto {
  @IsIn(["SCHEDULED", "CHECKED_IN", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
  status!: "SCHEDULED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

