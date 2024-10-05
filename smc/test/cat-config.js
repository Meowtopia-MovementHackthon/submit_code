const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("CatConfig", function () {
    let CatConfig
    let catConfig
    let owner, addr1, addr2

    beforeEach(async function () {
        ;[owner, addr1, addr2] = await ethers.getSigners()
        CatConfig = await ethers.getContractFactory("CatConfig")
        catConfig = await CatConfig.deploy()
    })

    describe("Adding cat types", function () {
        it("Should add a new cat type", async function () {
            await catConfig.addCatType("knight", 100, 50, 70, 30, 100, 200, 10, "A brave knight")
            const knightConfig = await catConfig.getCatTypeConfig("knight")

            expect(knightConfig.attack).to.equal(100)
            expect(knightConfig.armor).to.equal(50)
            expect(knightConfig.description).to.equal("A brave knight")
            expect(knightConfig.isActive).to.be.true
        })

        it("Should emit CatTypeAdded event", async function () {
            await expect(catConfig.addCatType("mage", 50, 30, 50, 100, 200, 150, 20, "A powerful mage")).to.emit(catConfig, "CatTypeAdded").withArgs("mage")
        })

        it("Should fail when adding an existing cat type", async function () {
            await catConfig.addCatType("knight", 100, 50, 70, 30, 100, 200, 10, "A brave knight")
            await expect(catConfig.addCatType("knight", 110, 60, 80, 40, 110, 210, 15, "Another knight")).to.be.revertedWith("Cat type already exists")
        })
    })

    describe("Updating cat types", function () {
        beforeEach(async function () {
            await catConfig.addCatType("knight", 100, 50, 70, 30, 100, 200, 10, "A brave knight")
        })

        it("Should update an existing cat type", async function () {
            await catConfig.updateCatType("knight", 110, 60, 80, 40, 110, 210, 15, "An upgraded knight")
            const updatedKnightConfig = await catConfig.getCatTypeConfig("knight")

            expect(updatedKnightConfig.attack).to.equal(110)
            expect(updatedKnightConfig.armor).to.equal(60)
            expect(updatedKnightConfig.description).to.equal("An upgraded knight")
        })

        it("Should emit CatTypeUpdated event", async function () {
            await expect(catConfig.updateCatType("knight", 110, 60, 80, 40, 110, 210, 15, "An upgraded knight")).to.emit(catConfig, "CatTypeUpdated").withArgs("knight")
        })

        it("Should fail when updating a non-existent cat type", async function () {
            await expect(catConfig.updateCatType("mage", 50, 30, 50, 100, 200, 150, 20, "A powerful mage")).to.be.revertedWith("Cat type does not exist")
        })
    })

    describe("Activating and deactivating cat types", function () {
        beforeEach(async function () {
            await catConfig.addCatType("knight", 100, 50, 70, 30, 100, 200, 10, "A brave knight")
        })

        it("Should deactivate a cat type", async function () {
            await catConfig.deactivateCatType("knight")
            const knightConfig = await catConfig.getCatTypeConfig("knight")
            expect(knightConfig.isActive).to.be.false
        })

        it("Should activate a deactivated cat type", async function () {
            await catConfig.deactivateCatType("knight")
            await catConfig.activateCatType("knight")
            const knightConfig = await catConfig.getCatTypeConfig("knight")
            expect(knightConfig.isActive).to.be.true
        })

        it("Should emit CatTypeDeactivated and CatTypeActivated events", async function () {
            await expect(catConfig.deactivateCatType("knight")).to.emit(catConfig, "CatTypeDeactivated").withArgs("knight")

            await expect(catConfig.activateCatType("knight")).to.emit(catConfig, "CatTypeActivated").withArgs("knight")
        })
    })

    describe("Getting cat types", function () {
        beforeEach(async function () {
            await catConfig.addCatType("knight", 100, 50, 70, 30, 100, 200, 10, "A brave knight")
            await catConfig.addCatType("mage", 50, 30, 50, 100, 200, 150, 20, "A powerful mage")
            await catConfig.addCatType("archer", 80, 40, 90, 60, 150, 180, 15, "A skilled archer")
        })

        it("Should get all cat types", async function () {
            const allCatTypes = await catConfig.getAllCatTypes()
            expect(allCatTypes.length).to.equal(3)
            expect(allCatTypes).to.include("knight")
            expect(allCatTypes).to.include("mage")
            expect(allCatTypes).to.include("archer")
        })

        it("Should get only active cat types", async function () {
            await catConfig.deactivateCatType("mage")
            const activeCatTypes = await catConfig.getActiveCatTypes()
            expect(activeCatTypes.length).to.equal(2)
            expect(activeCatTypes).to.include("knight")
            expect(activeCatTypes).to.include("archer")
            expect(activeCatTypes).to.not.include("mage")
        })
        it("Should check if a cat type is active", async function () {
            expect(await catConfig.isCatTypeActive("knight")).to.be.true
            await catConfig.deactivateCatType("knight")
            expect(await catConfig.isCatTypeActive("knight")).to.be.false
        })

        it("Should get a random active cat type", async function () {
            const randomCatType = await catConfig.getRandomActiveCatType(123) // Using 123 as a seed
            expect(["knight", "mage", "archer"]).to.include(randomCatType)
        })
    })
})
