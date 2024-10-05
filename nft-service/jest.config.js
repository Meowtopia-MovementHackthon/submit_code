const esModules = ["@nestjs/microservices"].join("|")
module.exports = {
    transform: {
        "\\.ts$": "ts-jest"
    },
    moduleNameMapper: {
        "^@utils$": "<rootDir>/src/utils",
    },
    transformIgnorePatterns: [`/node_modules/(?!${esModules})`]
}
