import { ConfigService } from "@nestjs/config"
import { WinstonModuleOptions, WinstonModuleOptionsFactory } from "nest-winston"
import { join } from "path"
import winston, { format, transports } from "winston"
import DailyRotateFile = require("winston-daily-rotate-file")

export class WinstonConfigService implements WinstonModuleOptionsFactory {
    logDir: string
    constructor(private readonly configService: ConfigService) {
        this.logDir = join(process.cwd(), this.configService.get<string>("LOG_DIR")!)
    }

    createWinstonModuleOptions(): WinstonModuleOptions | Promise<WinstonModuleOptions> {
        return {
            levels: winston.config.syslog.levels,
            format: this.formatLogMessage(),
            transports: [new transports.Console(), new DailyRotateFile({ filename: "%DATE%.log", datePattern: "YYYY-MM-DD", level: "info", dirname: this.logDir + "/info", maxFiles: 30, zippedArchive: true }), new DailyRotateFile({ filename: "%DATE%.log", datePattern: "YYYY-MM-DD", level: "error", dirname: this.logDir + "/error", maxFiles: 30, zippedArchive: true })]
        }
    }

    private formatLogMessage() {
        return format.combine(
            format.label({ label: this.configService.get<string>("SERVICE_NAME") }),
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.errors({ stack: true }),
            format.printf((info: any) => {
                return `[${info.label}] [${info.timestamp}] [${info.level.toUpperCase()}] - message: ${info.message}`
            }),
            format.colorize({ all: true })
        )
    }
}
