import { IsIn } from "class-validator";

export class SetQueueStatusDto {
  @IsIn(["WAITING", "CALLED", "IN_SERVICE", "DONE", "CANCELLED"])
  status!: "WAITING" | "CALLED" | "IN_SERVICE" | "DONE" | "CANCELLED";
}
