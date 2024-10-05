const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("MaterialItem", function () {
    let MaterialItem
    let materialItem
    let owner
    let addr1
    let addr2
    let addr3
    let landContract

    beforeEach(async function () {
        ;[owner, addr1, addr2, addr3] = await ethers.getSigners()

        MaterialItem = await ethers.getContractFactory("MaterialItem")
        materialItem = await MaterialItem.deploy()
        await materialItem.waitForDeployment()

        // Deploy mock LandERC404 contract
        const LandERC404 = await ethers.getContractFactory("LandERC404")
        landContract = await LandERC404.deploy("LandNFT", "LAND", 18, 1000, await owner.getAddress(), await materialItem.getAddress())
        await landContract.waitForDeployment()

        // Set land contract
        await materialItem.setLandContract(await landContract.getAddress())
    })

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await materialItem.owner()).to.equal(await owner.getAddress())
        })

        it("Should set the correct initial values", async function () {
            expect(await materialItem.MAX_MATERIAL_ITEMS()).to.equal(10)
            expect(await materialItem.EQUIPMENT_OFFSET()).to.equal(10)
            expect(await materialItem.UPGRADE_REQUIREMENT()).to.equal(3)
        })
    })

    describe("URI Management", function () {
        it("Should allow owner to set URI", async function () {
            await materialItem.setURI(0, "https://example.com/0")
            expect(await materialItem.uri(0)).to.equal("https://example.com/0")
        })

        it("Should not allow non-owner to set URI", async function () {
            await expect(materialItem.connect(addr1).setURI(0, "https://example.com/0")).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Land Contract Management", function () {
        it("Should allow owner to set land contract", async function () {
            const newLandContract = await addr1.getAddress()
            await materialItem.setLandContract(newLandContract)
            expect(await materialItem.landContract()).to.equal(newLandContract)
        })

        it("Should not allow non-owner to set land contract", async function () {
            await expect(materialItem.connect(addr1).setLandContract(addr2.getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Minting", function () {
        it("Should allow owner to mint material items", async function () {
            await materialItem.mint(addr1.getAddress(), 0, 1, "0x")
            expect(await materialItem.balanceOf(addr1.getAddress(), 0)).to.equal(1)
        })

        it("Should allow land contract to mint material items", async function () {
            await materialItem.setLandContract(await addr1.getAddress())
            await materialItem.connect(addr1).mint(addr2.getAddress(), 0, 1, "0x")
            expect(await materialItem.balanceOf(addr2.getAddress(), 0)).to.equal(1)
        })

        it("Should not allow non-authorized addresses to mint", async function () {
            await expect(materialItem.connect(addr1).mint(addr1.getAddress(), 0, 1, "0x")).to.be.revertedWith("Not authorized to mint")
        })

        it("Should not allow minting of non-material items", async function () {
            await expect(materialItem.mint(addr1.getAddress(), 10, 1, "0x")).to.be.revertedWith("Can only mint material items")
        })
    })

    describe("Batch Minting", function () {
        it("Should allow owner to batch mint material items", async function () {
            await materialItem.mintBatch(addr1.getAddress(), [0, 1, 2], [1, 2, 3], "0x")
            expect(await materialItem.balanceOf(addr1.getAddress(), 0)).to.equal(1)
            expect(await materialItem.balanceOf(addr1.getAddress(), 1)).to.equal(2)
            expect(await materialItem.balanceOf(addr1.getAddress(), 2)).to.equal(3)
        })

        it("Should not allow non-owner to batch mint", async function () {
            await expect(materialItem.connect(addr1).mintBatch(addr1.getAddress(), [0, 1], [1, 1], "0x")).to.be.revertedWith("Ownable: caller is not the owner")
        })

        it("Should not allow batch minting of non-material items", async function () {
            await expect(materialItem.mintBatch(addr1.getAddress(), [0, 10], [1, 1], "0x")).to.be.revertedWith("Can only mint material items")
        })
    })

    describe("Upgrading", function () {
        beforeEach(async function () {
            // Mint 3 material items of ID 0 to addr1
            await materialItem.mint(addr1.getAddress(), 0, 3, "0x")
        })

        it("Should allow upgrading material items to equipment", async function () {
            await materialItem.connect(addr1).upgradeMaterialToEquipment(0)
            expect(await materialItem.balanceOf(addr1.getAddress(), 0)).to.equal(0)
            expect(await materialItem.balanceOf(addr1.getAddress(), 10)).to.equal(1)
        })

        it("Should not allow upgrading with insufficient materials", async function () {
            await materialItem.connect(addr1).upgradeMaterialToEquipment(0)
            await expect(materialItem.connect(addr1).upgradeMaterialToEquipment(0)).to.be.revertedWith("Insufficient material items for upgrade")
        })

        it("Should not allow upgrading invalid material ID", async function () {
            await expect(materialItem.connect(addr1).upgradeMaterialToEquipment(10)).to.be.revertedWith("Invalid material item ID")
        })
    })

    describe("Burning", function () {
        beforeEach(async function () {
            await materialItem.mint(addr1.getAddress(), 0, 5, "0x")
        })

        it("Should allow burning of owned tokens", async function () {
            await materialItem.connect(addr1).burn(addr1.getAddress(), 0, 2)
            expect(await materialItem.balanceOf(addr1.getAddress(), 0)).to.equal(3)
        })

        it("Should not allow burning more tokens than owned", async function () {
            await expect(materialItem.connect(addr1).burn(addr1.getAddress(), 0, 6)).to.be.revertedWith("ERC1155: burn amount exceeds balance")
        })
    })
})
