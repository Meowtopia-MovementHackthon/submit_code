# Meowtoipa SMC

# Local Development

The following assumes the use of `node@>=14` and `npm@>=6`.

## Install Dependencies

`npm install --save-dev hardhat`

`npm install ganache-cli`

## Compile Contracts

`npx hardhat compile`

## Run Ganache-cli

`npx hardhat node`

## Run Tests

### Localhost

`npx hardhat --network localhost test` or `yarn test`

## Network

### Deploy Movement EVM Testnet

`npx hardhat run --network m1 deploy/movement/deploy.js`

### Verify + public source code on movement test net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network m1 verify --constructor-args ./args/movement/cat.js 0x1dD872A2956670882E1C8bEDc444244bfeC04F78
```

### Get verify network hardhat support

`npx hardhat verify --list-networks`

### Deployed Smart Contracts

CatConfig: 0xf8be1fC295C2D55a146532537Dd083e7dCD27Bec
MaterialItem NFT: 0xBe6899Fe97ee79b32f079a4C717329e6B8f2Ab90
Deploying SoulboundERC20...
MEOW Token: 0x6fa93001327E18e089De33fc4F819a074047acbC
Cat NFT: 0xa174353DCcb50237224b354077e5C2846f4e43c6