import { registerAs } from "@nestjs/config"

export default registerAs("app-config", () => ({
    serviceName: process.env.SERVICE_NAME || "top_nft_serivce",
    port: process.env.PORT || 3000,
    version: process.env.VERSION || "1.0",
    nodeEnv: process.env.NODE_ENV || "",
    networkFeeCoefficient: process.env.NETWORK_FEE_COEFFICIENT || 2,
    logDir: process.env.LOG_DIR || "logs"
}))
