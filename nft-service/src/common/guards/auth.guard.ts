import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Reflector } from "@nestjs/core"
import { JwtService } from "@nestjs/jwt"
import { MESSAGE_CODES } from "../constants"
import { IS_PUBLIC_KEY } from "../decorators/public.decorator"

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        if (isPublic) {
            return true
        }

        const { token } = this.extractCredentialFromHeader(request)

        if (!token) {
            throw new HttpException("unauthorized", HttpStatus.UNAUTHORIZED, {
                cause: {
                    code: MESSAGE_CODES.UNAUTHORIZED
                }
            })
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>("AUTH_SECRET")
            })

            request["user"] = payload
        } catch (error: any) {
            throw new HttpException("unauthorized", HttpStatus.UNAUTHORIZED, {
                cause: {
                    code: MESSAGE_CODES.UNAUTHORIZED
                }
            })
        }

        return true
    }

    private extractCredentialFromHeader(request: any): { token: string } {
        const token = request.headers["authorization"]?.split(" ")[1] || ""

        return {
            token
        }
    }
}
