import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"
import { ServeStaticModule } from "@nestjs/serve-static"
import { ThrottlerModule } from "@nestjs/throttler"
import { WinstonModule } from "nest-winston"
import { join } from "path"
import { AppController } from "./app.controller"
import { LoggerMiddleware, ThrottlerBehindProxyGuard, TransformInterceptor, ValidationPipe } from "./common"
import { AllExceptionsFilter } from "./common/exceptions"
import { validate } from "./common/validations/env.validation"
import { configurations } from "./configs/config"
import { WinstonConfigService } from "./configs/winston"
require("dotenv").config()

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, "..", "public")
        }),
        ConfigModule.forRoot({
            load: configurations,
            envFilePath: "./.env",
            isGlobal: true,
            validate: validate
        }),
        WinstonModule.forRootAsync({
            useFactory: (configService: ConfigService) => new WinstonConfigService(configService).createWinstonModuleOptions(),
            imports: [ConfigModule],
            inject: [ConfigService]
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100
            }
        ])
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard
        },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter
        }
    ]
})
export class AppModule implements NestModule {
    async configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("*")
    }
}
