import { RequestMethod, ValidationPipe } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"
import { AppModule } from "src/app.module"
import { setupSwagger } from "./configs"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const configService = app.get(ConfigService)

    app.setGlobalPrefix("api", {
        exclude: [{ path: "/", method: RequestMethod.ALL }]
    })
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    setupSwagger(app)

    app.enableCors({
        credentials: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        origin: "*"
    })

    await app.listen(configService.get("PORT")!, "0.0.0.0")
    console.log(`${configService.get("SERVICE_NAME")} is running on: ${await app.getUrl()}`)
}

bootstrap()
