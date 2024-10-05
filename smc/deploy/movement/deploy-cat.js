const { ethers, upgrades } = require("hardhat")

// async function main() {
//   // Get the contract factory
//   const AdvancedDynamicCatNFT = await ethers.getContractFactory("AdvancedDynamicCatNFT");

//   // Deploy params
//   const baseURI = "https://your-api-endpoint.com/metadata/";
//   const materialItemContractAddress = "0xF2F7119FA94E04E68FEC727F1b989C481898327f" // Replace with actual address
//   const catConfigAddress = "0xA0A7F452114818db90ce778CbB93f55436def9E0"; // Replace with actual address
//   const farmTokenAddress = "0x55763d2127F97F05eF903E6540494D00151fc6a1"; // Replace with actual address

//   console.log("Deploying AdvancedDynamicCatNFT...");

//   // Deploy the contract as upgradeable
//   const advancedDynamicCatNFT = await upgrades.deployProxy(AdvancedDynamicCatNFT,
//     [baseURI, materialItemContractAddress, catConfigAddress, farmTokenAddress],
//     { initializer: 'initialize' }
//   );

//   // Wait for the deployment transaction to be mined
//   await advancedDynamicCatNFT.waitForDeployment();

//   console.log("AdvancedDynamicCatNFT deployed to:", await advancedDynamicCatNFT.getAddress());
// }

async function main() {
    const proxyAddress = "0x01f562A25d2da7158FEc675C8a926CB1c4faDF97"
    const AdvancedDynamicCatNFT = await ethers.getContractFactory("AdvancedDynamicCatNFT")
      // Deploy params
    const baseURI = "https://jellyfish-app-qjqp9.ondigitalocean.app/api/metadata/cat/";
    const materialItemContractAddress = "0xF2F7119FA94E04E68FEC727F1b989C481898327f" // Replace with actual address
    const catConfigAddress = "0x8332Cbb8D9b1734d21411a60F943Eb3E40A8FF66"; // Replace with actual address
    const farmTokenAddress = "0x55763d2127F97F05eF903E6540494D00151fc6a1"; // Replace with actual address

    console.log("Upgrading AdvancedDynamicCatNFT...")
    const newContract = await upgrades.upgradeProxy(proxyAddress, AdvancedDynamicCatNFT)
    // await newContract.setfarmContract(farmTokenAddress)
    // await newContract.setCatConfigContract(catConfigAddress);
    // await newContract.setBaseURI(baseURI);
    console.log("Cat upgraded")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
