const hre = require("hardhat")
const { parseEther } = require("ethers")

async function main() {
    // deploy test token
    const marketplaceContract = await hre.ethers.getContractFactory("MockMarketplaceV2")
    const deployMarketplaceContract = await marketplaceContract.deploy(10, ethers.parseEther("0.0001"), ethers.parseEther("0.0001"))
    await deployMarketplaceContract.waitForDeployment()
    console.log("marketplace contract :", await deployMarketplaceContract.getAddress())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
