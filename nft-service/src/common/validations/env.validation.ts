import { plainToInstance } from "class-transformer"
import { IsBoolean, IsNumber, IsString, validateSync } from "class-validator"
class EnvironmentVariables {
    @IsString()
    SERVICE_NAME: string

    @IsString()
    VERSION: string

    @IsNumber()
    PORT: number

    @IsString()
    NODE_ENV: string

    @IsString()
    LOG_DIR: string
}

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true
    })
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false
    })

    if (errors.length > 0) {
        throw new Error(`missing env: ${errors.toString()}`)
    }
    return validatedConfig
}
