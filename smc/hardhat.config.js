require("@nomiclabs/hardhat-ganache")
require("@nomiclabs/hardhat-ethers")
require("@nomicfoundation/hardhat-verify")
require("@nomicfoundation/hardhat-chai-matchers")
require("@openzeppelin/hardhat-upgrades")
require("dotenv").config()

module.exports = {
    defaultNetwork: "ganache",
    solidity: {
        compilers: [
            { version: "0.5.16" },
            { version: "0.8.0" },
            {
                version: "0.6.12",
                settings: { optimizer: { enabled: true, runs: 1000 } }
            },
            {
                version: "0.8.4",
                settings: { optimizer: { enabled: true, runs: 1000 } }
            },
            {
                version: "0.8.19",
                settings: { optimizer: { enabled: true, runs: 1000 }, viaIR: true }
            },
            {
                version: "0.8.20",
                settings: { optimizer: { enabled: true, runs: 1000 }, viaIR: true }
            },
            {
                version: "0.8.22",
                settings: { optimizer: { enabled: true, runs: 1000 }, viaIR: true }
            }
        ]
    },
    networks: {
        hardhat: {
            chainId: 31337
        },
        ganache: {
            url: "http://ganache:8545",
            accounts: {
                mnemonic: "tail actress very wool broom rule frequent ocean nice cricket extra snap",
                path: " m/44'/60'/0'/0/",
                initialIndex: 0,
                count: 20
            }
        },
        linea_goerli: {
            url: process.env.LINEA_GOERLI_INFURA_RPC,
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        linea_mainnet: {
            url: process.env.LINEA_MAINNET_INFURA_RPC,
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        base_mainnet: {
            url: "https://mainnet.base.org",
            accounts: [`${process.env.PRIVATE_KEY}`],
            gasPrice: 1000000000
        },
        base_sepolia: {
            url: "https://public.stackup.sh/api/v1/node/base-sepolia",
            accounts: [`${process.env.PRIVATE_KEY}`],
            gasPrice: 1000000000
        },
        linea_sepolia: {
            url: "https://linea-sepolia.infura.io/v3/a4b52b1122854f89a37329648bb52626",
            accounts: [`${process.env.PRIVATE_KEY}`],
            gasPrice: 1000000000
        },
        bsct: {
            url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
            accounts: [`${process.env.PRIVATE_KEY}`]
            // gas: 8100000,
            // gasPrice: 8000000000,
        },
        // New networks
        optimism: {
            url: process.env.OPTIMISM_RPC || "https://mainnet.optimism.io",
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        bitlayer_mainnet: {
            chainId: 200901,
            gasPrice: 110000000,
            url: "https://rpc-bitlayer.rockx.com",
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        manta_mainnet: {
            url: process.env.MANTA_MAINNET_RPC || "https://pacific-rpc.manta.network/http",
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        scroll_mainnet: {
            url: process.env.SCROLL_MAINNET_RPC || "https://rpc.scroll.io",
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        bartio_testnet: {
            url: "https://bartio.rpc.berachain.com",
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 80084
        },
        m1: {
            url: "https://30732.rpc.thirdweb.com",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 30732
        },
        soneium_minato: {
            chainId: 1946,
            url: "https://rpc.minato.soneium.org",
            accounts: [`${process.env.PRIVATE_KEY}`]
        },
        zetachain: {
            url: "https://zetachain-mainnet.public.blastapi.io",
            accounts: [process.env.PRIVATE_KEY],
            chainId: 7000
        },
        mantle: {
            chainId: 5000,
            url: "https://rpc.mantle.xyz",
            accounts: [process.env.PRIVATE_KEY]
        },
        taiko: {
            url: "https://rpc.mainnet.taiko.xyz",
            accounts: [process.env.PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: {
            linea_testnet: process.env.LINEASCAN_API_KEY,
            linea_sepolia: process.env.LINEASCAN_API_KEY,
            linea_mainnet: process.env.LINEASCAN_API_KEY,
            base_sepolia: process.env.BASESCAN_API_KEY,
            bscTestnet: process.env.BSCSCAN_API_KEY,
            optimisticEthereum: process.env.OPTIMISM_API_KEY,
            bitlayer: process.env.BITLAYER_API_KEY,
            manta_mainnet: "manta_mainnet",
            scroll_mainnet: process.env.SCROLL_API_KEY,
            bartio_testnet: "bartio_testnet",
            soneium_minato: "soneium_minato",
            zetachain: "zetachain",
            taiko: process.env.TAIKO_API_KEY
        },
        customChains: [
            {
                network: "linea_testnet",
                chainId: 59140,
                urls: {
                    apiURL: "https://api-testnet.lineascan.build/api",
                    browserURL: "https://goerli.lineascan.build/"
                }
            },
            {
                network: "linea_mainnet",
                chainId: 59144,
                urls: {
                    apiURL: "https://api.lineascan.build/api",
                    browserURL: "https://lineascan.build/"
                }
            },
            {
                network: "base_sepolia",
                chainId: 84532,
                urls: {
                    apiURL: "https://public.stackup.sh/api/v1/node/base-sepolia",
                    browserURL: "https://sepolia.basescan.org/"
                }
            },
            {
                network: "bitlayer_mainnet",
                chainId: 200901,
                gas: "auto",
                urls: {
                    apiURL: "https://rpc.bitlayer.org/",
                    browserURL: "https://www.btrscan.com"
                }
            },
            {
                network: "manta_mainnet",
                chainId: 169,
                urls: {
                    apiURL: "https://manta-pacific.drpc.org",
                    browserURL: "https://pacific-explorer.manta.network"
                }
            },
            {
                network: "scroll_mainnet",
                chainId: 534352,
                urls: {
                    apiURL: "https://api.scrollscan.com/api",
                    browserURL: "https://scrollscan.com"
                }
            },
            {
                network: "bartio_testnet",
                chainId: 80084,
                urls: {
                    apiURL: "https://api.routescan.io/v2/network/testnet/evm/80084/etherscan", // https://bartio.beratrail.io/documentation/recipes/hardhat-verification
                    browserURL: "https://bartio.beratrail.io"
                }
            },
            {
                network: "soneium_minato",
                chainId: 1946,
                urls: {
                    apiURL: "https://eth-sepolia.blockscout.com/api",
                    browserURL: "https://explorer-testnet.soneium.org"
                }
            },
            {
                network: "zetachain",
                chainId: 7000,
                urls: {
                    apiURL: "https://zetachain-mainnet.g.allthatnode.com/archive/rest",
                    browserURL: "https://explorer.zetachain.com"
                }
            },
            {
                network: "taiko",
                chainId: 167000,
                urls: {
                    apiURL: "https://blockscoutapi.hekla.taiko.xyz/api",
                    browserURL: "https://explorer.taiko.xyz"
                }
            }
        ]
    }
}
