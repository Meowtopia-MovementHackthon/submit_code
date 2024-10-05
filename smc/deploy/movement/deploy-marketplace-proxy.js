const { ethers, upgrades } = require("hardhat")

async function main() {
    // deploy 404 for test
    const erc404Contract = await ethers.getContractFactory("DINOERC404")
    const deployErc404Contract = await erc404Contract.deploy("Jurassic Legends", "DINO404", 18, 5555, "0xeF7EcE90E670736918d0b34aac6CeEE1F5BA2De2")

    await deployErc404Contract.waitForDeployment()
    console.log("erc404 contract:", await deployErc404Contract.getAddress())

    // deploy marketplace contract
    const marketplaceContract = await ethers.getContractFactory("MockMarketplace")
    const deployMarketplaceContract = await upgrades.deployProxy(marketplaceContract, [10, ethers.parseEther("0.01"), ethers.parseEther("0.01")])
    await deployMarketplaceContract.waitForDeployment()
    console.log("marketplace contract proxy:", await deployMarketplaceContract.getAddress())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
