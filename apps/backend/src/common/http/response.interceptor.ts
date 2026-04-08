import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export type ApiResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === "object" && "success" in data && "data" in data) {
          return data;
        }
        return { success: true, data };
      })
    );
  }
}

