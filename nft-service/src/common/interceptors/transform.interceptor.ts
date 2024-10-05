import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from "@nestjs/common"
import { Observable, map } from "rxjs"
import { ResponseType } from "../dtos"

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseType<T>> {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<ResponseType<T>> | Promise<Observable<ResponseType<T>>> {
        const response = context.switchToHttp().getResponse()

        if (response.statusCode === HttpStatus.FOUND) {
            // is redirect route
            return next.handle()
        }

        const url = context.switchToHttp().getRequest().url

        if ((url && url.match(/metadata/)) || url.match(/metadata/)) {
            return next.handle()
        }

        return next.handle().pipe(
            map((data) => ({
                statusCode: response.statusCode,
                code: data?.code,
                data: data?.data,
                metadata: data?.metadata
            }))
        )
    }
}
