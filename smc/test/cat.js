const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("AdvancedDynamicCatNFT and CatConfig", function () {
    let CatConfig, catConfig
    let AdvancedDynamicCatNFT, advancedDynamicCatNFT
    let MaterialItem, materialItem
    let FarmToken, farmToken
    let owner, addr1, addr2

    beforeEach(async function () {
        ;[owner, addr1, addr2] = await ethers.getSigners()

        // Deploy CatConfig
        CatConfig = await ethers.getContractFactory("CatConfig")
        catConfig = await CatConfig.deploy()

        // Deploy MaterialItem (mock for testing)
        MaterialItem = await ethers.getContractFactory("MaterialItem")
        materialItem = await MaterialItem.deploy()

        // Deploy FarmToken (mock for testing)
        FarmToken = await ethers.getContractFactory("SoulboundERC20")
        farmToken = await FarmToken.deploy("Soulbound", "SBT")

        // Deploy AdvancedDynamicCatNFT
        AdvancedDynamicCatNFT = await ethers.getContractFactory("AdvancedDynamicCatNFT")
        advancedDynamicCatNFT = await AdvancedDynamicCatNFT.deploy("https://example.com/api/", await materialItem.getAddress(), await catConfig.getAddress(), await farmToken.getAddress())

        await farmToken.mint(await advancedDynamicCatNFT.getAddress(), ethers.parseEther("1000000"))
    })

    describe("CatConfig", function () {
        it("Should add a new cat type", async function () {
            await catConfig.addCatType("Siamese", 100, 50, 80, 70, 200, 500, 20, "A sleek and vocal cat breed")

            const catType = await catConfig.getCatTypeConfig("Siamese")
            expect(catType.attack).to.equal(100n)
            expect(catType.healthPoint).to.equal(500n)
            expect(catType.description).to.equal("A sleek and vocal cat breed")
            expect(catType.isActive).to.be.true
        })

        it("Should add and update equipment bonus", async function () {
            await catConfig.addEquipmentBonus(10, 10, 5, 0, 0, 0, 50, 5, "Basic armor")

            let equipment = await catConfig.getEquipmentBonus(10)
            expect(equipment.attack).to.equal(10n)
            expect(equipment.healthPoint).to.equal(50n)

            await catConfig.updateEquipmentBonus(10, 15, 10, 0, 0, 0, 75, 10, "Improved basic armor")

            equipment = await catConfig.getEquipmentBonus(10)
            expect(equipment.attack).to.equal(15n)
            expect(equipment.healthPoint).to.equal(75n)
            expect(equipment.description).to.equal("Improved basic armor")
        })

        it("Should activate and deactivate cat types and equipment", async function () {
            await catConfig.addCatType("Persian", 90, 60, 70, 80, 180, 550, 15, "A long-haired cat breed")
            await catConfig.deactivateCatType("Persian")
            expect(await catConfig.isCatTypeActive("Persian")).to.be.false

            await catConfig.activateCatType("Persian")
            expect(await catConfig.isCatTypeActive("Persian")).to.be.true

            await catConfig.addEquipmentBonus(11, 5, 15, 0, 10, 0, 30, 0, "Magic amulet")
            await catConfig.deactivateEquipmentBonus(11)
            expect(await catConfig.isEquipmentBonusActive(11)).to.be.false

            await catConfig.activateEquipmentBonus(11)
            expect(await catConfig.isEquipmentBonusActive(11)).to.be.true
        })
    })

    describe("AdvancedDynamicCatNFT", function () {
        beforeEach(async function () {
            // Add a cat type and equipment for testing
            await catConfig.addCatType("Knight", 110, 55, 75, 65, 220, 600, 25, "A large and sociable cat breed")
            await catConfig.addEquipmentBonus(10, 10, 5, 0, 0, 0, 50, 5, "Basic armor")
        })

        it("Should mint a new cat", async function () {
            await advancedDynamicCatNFT.mint(addr1.address, "Knight")
            expect(await advancedDynamicCatNFT.ownerOf(1n)).to.equal(addr1.address)

            const catMetadata = await advancedDynamicCatNFT.getCatMetadata(1n)
            expect(catMetadata.catType).to.equal("Knight")
            expect(catMetadata.level).to.equal(1n)
            expect(catMetadata.attack).to.equal(110n)
            expect(catMetadata.healthPoint).to.equal(600n)
        })

        it("Should equip and unequip items", async function () {
            await advancedDynamicCatNFT.mint(addr1.address, "Knight")

            // Mock minting of equipment to addr1
            await materialItem.mint(addr1.address, 10, 1, "0x")

            // Approve NFT contract to use the equipment
            await materialItem.connect(addr1).setApprovalForAll(await advancedDynamicCatNFT.getAddress(), true)

            // Equip the item
            await advancedDynamicCatNFT.connect(addr1).equipItem(1n, 10n)

            let catMetadata = await advancedDynamicCatNFT.getCatMetadata(1n)
            expect(catMetadata.equippedItems.length).to.equal(1n)
            expect(catMetadata.equippedItems[0]).to.equal(10n)
            expect(catMetadata.attack).to.equal(120n) // 110 + 10 from equipment

            // Unequip the item
            await advancedDynamicCatNFT.connect(addr1).unequipItem(1n, 10n)

            catMetadata = await advancedDynamicCatNFT.getCatMetadata(1n)
            expect(catMetadata.equippedItems.length).to.equal(0n)
            expect(catMetadata.attack).to.equal(110n) // Back to original value
        })

        it("Should upgrade cats", async function () {
            await advancedDynamicCatNFT.mint(addr1.address, "Knight")
            await advancedDynamicCatNFT.mint(addr1.address, "Knight")

            await advancedDynamicCatNFT.connect(addr1).upgradeCat(1n, 2n)

            const catMetadata = await advancedDynamicCatNFT.getCatMetadata(1n)
            expect(catMetadata.level).to.equal(2n)
            expect(catMetadata.attack).to.equal(220n) // (110 + 110)
            expect(catMetadata.healthPoint).to.equal(1200n) // (600 + 600)

            await expect(advancedDynamicCatNFT.ownerOf(2n)).to.be.revertedWith("ERC721: invalid token ID")
        })

        it("Should claim farm tokens", async function () {
            await advancedDynamicCatNFT.mint(addr1.address, "Knight")

            // Fast-forward time by 1 day
            await ethers.provider.send("evm_increaseTime", [86400])
            await ethers.provider.send("evm_mine")

            await farmToken.addWhitelist(await advancedDynamicCatNFT.getAddress())

            const initialBalance = await farmToken.balanceOf(addr1.address)
            await advancedDynamicCatNFT.connect(addr1).claimFarmTokens(1n)
            const finalBalance = await farmToken.balanceOf(addr1.address)

            expect(finalBalance).to.be.gt(initialBalance)
        })
    })
})
