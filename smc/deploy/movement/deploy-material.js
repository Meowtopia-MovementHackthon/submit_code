const { ethers, upgrades } = require("hardhat")

// async function main() {
//   const MaterialItem = await ethers.getContractFactory("MaterialItem");
//   console.log("Deploying MaterialItem...");
//   const materialItem = await upgrades.deployProxy(MaterialItem, [], { initializer: 'initialize' });
//   await materialItem.waitForDeployment();
//   console.log("MaterialItem deployed to:", await materialItem.getAddress());
// }

async function main() {
    const proxyAddress = "0xF2F7119FA94E04E68FEC727F1b989C481898327f"
    const MaterialItem = await ethers.getContractFactory("MaterialItem")
    console.log("Upgrading MaterialItem...")
    const newContract = await upgrades.upgradeProxy(proxyAddress, MaterialItem)
    await newContract.setBaseURL("https://jellyfish-app-qjqp9.ondigitalocean.app/api/metadata/material/")
    console.log("MaterialItem upgraded")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
