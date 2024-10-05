const hre = require("hardhat")

async function main() {
    // const implementAddress = "0x6e723041EF1E3C3F79Ee1439262004D02d5909D2";
    const proxyAddress = "0xefd09f4FA4412c7f12ae223Df0f9B49d196E403F"

    const marketplaceContract = await hre.ethers.getContractFactory("MockMarketplace")

    const upgradeMarketplaceContract = await hre.upgrades.upgradeProxy(proxyAddress, marketplaceContract)
    console.log("upgrade marketplace contract proxy:", await upgradeMarketplaceContract.getAddress())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
