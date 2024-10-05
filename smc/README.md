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

SoundBound Token: 0x55763d2127F97F05eF903E6540494D00151fc6a1
Cat NFT: 0x01f562A25d2da7158FEc675C8a926CB1c4faDF97
Material Item NFT: 0xF2F7119FA94E04E68FEC727F1b989C481898327f