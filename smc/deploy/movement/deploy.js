const { ethers, upgrades } = require("hardhat")

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account:", deployer.address)

    // Deploy CatConfig
    const CatConfig = await ethers.getContractFactory("CatConfig")
    const catConfig = await CatConfig.deploy()
    await catConfig.waitForDeployment()
    console.log("CatConfig deployed to:", await catConfig.getAddress())

    // Add cat types
    await catConfig.addCatType("knight", 220, 250, 150, 80, 100, 150, 50, "Knight config", 30 * 24 * 60 * 60)
    await catConfig.addCatType("archer", 250, 100, 220, 80, 80, 120, 70, "Archer config", 30 * 24 * 60 * 60)
    await catConfig.addCatType("mage", 80, 70, 120, 300, 270, 160, 60, "Mage config", 30 * 24 * 60 * 60)
    await catConfig.addCatType("priest", 80, 120, 100, 250, 230, 150, 20, "Priest config", 30 * 24 * 60 * 60)
    await catConfig.addCatType("assassin", 280, 80, 180, 70, 70, 120, 280, "Assassin config", 30 * 24 * 60 * 60)

    // Add equipment bonus
    await catConfig.addEquipmentBonus(10, 10, 10, 10, 10, 10, 10, 10, "Equipment bonus 1", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(11, 20, 20, 20, 20, 20, 20, 20, "Equipment bonus 2", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(12, 30, 30, 30, 30, 30, 30, 30, "Equipment bonus 3", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(13, 40, 40, 40, 40, 40, 40, 40, "Equipment bonus 4", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(14, 50, 50, 50, 50, 50, 50, 50, "Equipment bonus 5", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(15, 60, 60, 60, 60, 60, 60, 60, "Equipment bonus 6", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(16, 70, 70, 70, 70, 70, 70, 70, "Equipment bonus 7", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(17, 80, 80, 80, 80, 80, 80, 80, "Equipment bonus 8", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(18, 90, 90, 90, 90, 90, 90, 90, "Equipment bonus 9", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(19, 100, 100, 100, 100, 100, 100, 100, "Equipment bonus 10", 3 * 24 * 60 * 60)

    // Add upgrade bonus
    await catConfig.setUpgradeBonus(1, 10, 10, 10, 10, 10, 10, 10, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(2, 20, 20, 20, 20, 20, 20, 20, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(3, 30, 30, 30, 30, 30, 30, 30, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(4, 40, 40, 40, 40, 40, 40, 40, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(5, 50, 50, 50, 50, 50, 50, 50, 7 * 24 * 60 * 60)

    // Deploy MaterialItem
    const MaterialItem = await ethers.getContractFactory("MaterialItem")
    const materialItem = await MaterialItem.deploy()
    await materialItem.waitForDeployment()
    console.log("MaterialItem deployed to:", await materialItem.getAddress())

    // Deploy SoulboundERC20 (Farm Token)
    const SoulboundERC20 = await ethers.getContractFactory("SoulboundERC20")
    const farmToken = await SoulboundERC20.deploy("Soundbound MEOW Token", "sMEOW")
    await farmToken.waitForDeployment()
    console.log("SoulboundERC20 (sMEOW) deployed to:", await farmToken.getAddress())

    // Deploy LandERC404
    const LandERC404 = await ethers.getContractFactory("LandERC404")
    const landERC404 = await LandERC404.deploy(
        "Land NFT",
        "LAND",
        18,
        1000, // maxMint
        deployer.address, // recipient
        await materialItem.getAddress() // materialItemContract
    )
    await landERC404.waitForDeployment()
    console.log("LandERC404 deployed to:", await landERC404.getAddress())

    // Set LandERC404 address in MaterialItem contract
    await materialItem.setLandContract(await landERC404.getAddress())
    console.log("Set LandERC404 address in MaterialItem contract")

    // Deploy AdvancedDynamicCatNFT (using upgrades.deployProxy for upgradeability)
    const AdvancedDynamicCatNFT = await ethers.getContractFactory("AdvancedDynamicCatNFT")
    const advancedDynamicCatNFT = await AdvancedDynamicCatNFT.deploy(
        "https://api.example.com/cat/", // baseURI
        await materialItem.getAddress(), // materialItemContractAddress
        await catConfig.getAddress(), // catConfigAddress
        await farmToken.getAddress() // farmTokenAddress
    )
    await advancedDynamicCatNFT.waitForDeployment()
    console.log("AdvancedDynamicCatNFT deployed to:", await advancedDynamicCatNFT.getAddress())

    // pool farm token for cat smart contract
    await farmToken.addWhitelist(await advancedDynamicCatNFT.getAddress())
    await farmToken.mint(await advancedDynamicCatNFT.getAddress(), 1000000000000000000000000n)
    console.log("Pool farm token for cat smart contract: 100m sMEOW")

    console.log("All contracts deployed successfully!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
