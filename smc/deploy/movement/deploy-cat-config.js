const { ethers, upgrades } = require("hardhat")

async function main() {
    const CatConfig = await ethers.getContractFactory("CatConfig")
    console.log("Deploying CatConfig...")
    const catConfig = await upgrades.deployProxy(CatConfig, [], { initializer: "initialize" })
    await catConfig.waitForDeployment()
    console.log("CatConfig deployed to:", await catConfig.getAddress())

    // Add cat types
    await catConfig.addCatType(1, 220, 250, 150, 80, 100, 150, 50, "Knight config", 30 * 24 * 60 * 60)
    await catConfig.addCatType(2, 250, 100, 220, 80, 80, 120, 70, "Archer config", 30 * 24 * 60 * 60)
    await catConfig.addCatType(3, 80, 70, 120, 300, 270, 160, 60, "Mage config", 30 * 24 * 60 * 60)
    await catConfig.addCatType(4, 80, 120, 100, 250, 230, 150, 20, "Priest config", 30 * 24 * 60 * 60)
    await catConfig.addCatType(5, 280, 80, 180, 70, 70, 120, 280, "Assassin config", 30 * 24 * 60 * 60)

    // Add equipment bonus
    await catConfig.addEquipmentBonus(15, 10, 10, 10, 10, 10, 10, 10, "Equipment bonus 1", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(16, 20, 20, 20, 20, 20, 20, 20, "Equipment bonus 2", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(17, 30, 30, 30, 30, 30, 30, 30, "Equipment bonus 3", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(18, 40, 40, 40, 40, 40, 40, 40, "Equipment bonus 4", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(19, 50, 50, 50, 50, 50, 50, 50, "Equipment bonus 5", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(20, 60, 60, 60, 60, 60, 60, 60, "Equipment bonus 6", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(21, 70, 70, 70, 70, 70, 70, 70, "Equipment bonus 7", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(22, 80, 80, 80, 80, 80, 80, 80, "Equipment bonus 8", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(23, 90, 90, 90, 90, 90, 90, 90, "Equipment bonus 9", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(24, 100, 100, 100, 100, 100, 100, 100, "Equipment bonus 10", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(25, 40, 40, 40, 40, 40, 40, 40, "Equipment bonus 4", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(26, 50, 50, 50, 50, 50, 50, 50, "Equipment bonus 5", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(27, 60, 60, 60, 60, 60, 60, 60, "Equipment bonus 6", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(28, 70, 70, 70, 70, 70, 70, 70, "Equipment bonus 7", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(29, 80, 80, 80, 80, 80, 80, 80, "Equipment bonus 8", 3 * 24 * 60 * 60)
    await catConfig.addEquipmentBonus(30, 90, 90, 90, 90, 90, 90, 90, "Equipment bonus 9", 3 * 24 * 60 * 60)

    // Add upgrade bonus
    await catConfig.setUpgradeBonus(2, 20, 20, 20, 20, 20, 20, 20, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(3, 30, 30, 30, 30, 30, 30, 30, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(4, 40, 40, 40, 40, 40, 40, 40, 7 * 24 * 60 * 60)
    await catConfig.setUpgradeBonus(5, 50, 50, 50, 50, 50, 50, 50, 7 * 24 * 60 * 60)

    console.log("CatConfig setup completed")
}

// Upgrade function (commented out for now)
/*
async function upgrade() {
   const proxyAddress = "YOUR_PROXY_ADDRESS_HERE";
   const CatConfig = await ethers.getContractFactory("CatConfig");
   console.log("Upgrading CatConfig...");
   await upgrades.upgradeProxy(proxyAddress, CatConfig);
   console.log("CatConfig upgraded");

   const catConfig = await ethers.getContractAt("CatConfig", proxyAddress);
   
   // Add or update cat types if needed
   // await catConfig.addCatType(1, 220, 250, 150, 80, 100, 150, 50, "Updated Knight config", 30 * 24 * 60 * 60);
   
   // Add or update equipment bonuses if needed
   // await catConfig.addEquipmentBonus(20, 110, 110, 110, 110, 110, 110, 110, "New Equipment bonus", 3 * 24 * 60 * 60);
   
   // Update upgrade bonuses if needed
   // await catConfig.setUpgradeBonus(6, 60, 60, 60, 60, 60, 60, 60, 7 * 24 * 60 * 60);

   console.log("CatConfig update completed");
}
*/

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
