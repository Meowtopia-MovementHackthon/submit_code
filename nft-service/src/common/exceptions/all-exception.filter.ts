import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Inject } from "@nestjs/common"
import { HttpAdapterHost } from "@nestjs/core"
import { WINSTON_MODULE_PROVIDER } from "nest-winston"
import { Logger } from "winston"
import { MESSAGE_CODES } from "../constants"

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger
    ) {}

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost

        const ctx = host.switchToHttp()
        const isHttpException = exception instanceof HttpException
        const httpStatus = isHttpException ? exception.getStatus() : exception.status
        const cause = exception.cause

        const responseBody = {
            statusCode: httpStatus,
            code: cause?.code || MESSAGE_CODES.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest())
        }

        this.logger.error(
            `Exception: ${JSON.stringify({
                ...responseBody,
                message: isHttpException ? exception.getResponse() : exception.message,
                response: cause?.message,
                stack: exception?.stack
            })}`,
            {
                ...cause?.tag
            }
        )

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
    }
}
