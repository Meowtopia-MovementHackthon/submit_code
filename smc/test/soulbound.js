const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("SoulboundERC20", function () {
    let SoulboundERC20, MockUSDT
    let soulboundToken, usdtToken
    let owner, addr1, addr2, addrs

    beforeEach(async function () {
        ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()

        MockUSDT = await ethers.getContractFactory("MockUSDT")
        usdtToken = await MockUSDT.deploy()
        await usdtToken.waitForDeployment()

        SoulboundERC20 = await ethers.getContractFactory("SoulboundERC20")
        soulboundToken = await SoulboundERC20.deploy(await usdtToken.getAddress())
        await soulboundToken.waitForDeployment()
    })

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await soulboundToken.owner()).to.equal(await owner.getAddress())
        })

        it("Should have correct name and symbol", async function () {
            expect(await soulboundToken.name()).to.equal("SoulBound")
            expect(await soulboundToken.symbol()).to.equal("SBT")
        })
    })

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            await soulboundToken.mint(await addr1.getAddress(), 100)
            expect(await soulboundToken.balanceOf(await addr1.getAddress())).to.equal(100)
        })
        it("Should not allow burning more tokens than balance", async function () {
            await soulboundToken.mint(await addr1.getAddress(), 100)
            await expect(soulboundToken.connect(addr1).burn(150)).to.be.reverted
        })
    })

    describe("Transfers", function () {
        beforeEach(async function () {
            await soulboundToken.mint(await addr2.getAddress(), 100)
        })

        it("Should not allow transfer between non-whitelisted addresses", async function () {
            await expect(soulboundToken.connect(addr2).transfer(await addr1.getAddress(), 50)).to.be.revertedWith("Soulbound tokens are not transferable")
        })

        it("Should allow transfer from whitelisted address", async function () {
            await soulboundToken.connect(owner).addWhitelist(await addr2.getAddress())
            await soulboundToken.connect(addr2).transfer(await addr1.getAddress(), 50)
            expect(await soulboundToken.balanceOf(await addr2.getAddress())).to.equal(50)
            expect(await soulboundToken.balanceOf(await addr1.getAddress())).to.equal(50)
        })
    })

    describe("Whitelisting", function () {
        it("Should allow owner to whitelist an address", async function () {
            await soulboundToken.connect(owner).addWhitelist(await addr1.getAddress())
            expect(await soulboundToken.whitelists(await addr1.getAddress())).to.be.true
        })

        it("Should not allow non-owner to whitelist an address", async function () {
            await expect(soulboundToken.connect(addr2).addWhitelist(await addr1.getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Pool Management", function () {
        it("Should allow owner to create a pool", async function () {
            await soulboundToken.connect(owner).createPool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18))
            const pool = await soulboundToken.pools(0)
            expect(pool.maxUsers).to.equal(100)
            expect(pool.price).to.equal(ethers.parseUnits("1", 18))
            expect(pool.isActive).to.be.true
        })

        it("Should allow owner to update a pool", async function () {
            await soulboundToken.connect(owner).createPool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18))
            await soulboundToken.connect(owner).updatePool(0, 200, ethers.parseUnits("2", 18), 2000, false, ethers.parseUnits("15", 18), ethers.parseUnits("25", 18), 0)
            const pool = await soulboundToken.pools(0)
            expect(pool.maxUsers).to.equal(200)
            expect(pool.price).to.equal(ethers.parseUnits("2", 18))
            expect(pool.isActive).to.be.false
        })

        it("Should not allow non-owner to create or update a pool", async function () {
            await expect(soulboundToken.connect(addr1).createPool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18))).to.be.revertedWith("Ownable: caller is not the owner")

            await expect(soulboundToken.connect(addr1).updatePool(0, 200, ethers.parseUnits("2", 18), 2000, false, ethers.parseUnits("15", 18), ethers.parseUnits("25", 18), 0)).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Deposit and Purchase", function () {
        beforeEach(async function () {
            await soulboundToken.connect(owner).createPool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18))
            await usdtToken.mint(await addr1.getAddress(), ethers.parseUnits("100", 18))
            await usdtToken.connect(addr1).approve(await soulboundToken.getAddress(), ethers.parseUnits("100", 18))
        })

        it("Should allow user to deposit", async function () {
            await soulboundToken.setCurrentTime(1001)
            await usdtToken.connect(addr1).approve(await soulboundToken.getAddress(), ethers.parseUnits("100", 18))
            await soulboundToken.connect(addr1).deposit(0)
            const pool = await soulboundToken.pools(0)
            expect(pool.userCount).to.equal(1)
        })

        it("Should not allow user to deposit twice", async function () {
            await soulboundToken.setCurrentTime(1001)
            await soulboundToken.connect(addr1).deposit(0)
            await expect(soulboundToken.connect(addr1).deposit(0)).to.be.revertedWith("User has already deposited")
        })

        it("Should allow user to purchase", async function () {
            await soulboundToken.setCurrentTime(1001)
            await usdtToken.mint(await addr2.getAddress(), ethers.parseUnits("100", 18))
            await usdtToken.connect(addr2).approve(await soulboundToken.getAddress(), ethers.parseUnits("100", 18))
            await soulboundToken.connect(addr2).deposit(0)
            await soulboundToken.connect(owner).updatePool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18), 1)
            const balanceBefore = await soulboundToken.balanceOf(await addr2.getAddress())
            await soulboundToken.connect(addr2).purchase(0)
            const balanceAfter = await soulboundToken.balanceOf(await addr2.getAddress())
            expect(balanceAfter - balanceBefore).to.equal(ethers.parseUnits("20", 18))
        })

        it("Should not allow user to purchase without deposit", async function () {
            await soulboundToken.setCurrentTime(1001)
            await soulboundToken.connect(owner).updatePool(0, 100, ethers.parseUnits("1", 18), 1000, true, ethers.parseUnits("10", 18), ethers.parseUnits("20", 18), 1)
            await expect(soulboundToken.connect(addr2).purchase(0)).to.be.revertedWith("No deposit in this pool")
        })
    })

    describe("Token Withdrawals", function () {
        it("Should allow owner to withdraw ERC20 tokens", async function () {
            await usdtToken.mint(await soulboundToken.getAddress(), ethers.parseUnits("100", 18))
            await soulboundToken.connect(owner).witdhrawERC20Token(await usdtToken.getAddress(), ethers.parseUnits("100", 18), await addr1.getAddress())
            expect(await usdtToken.balanceOf(await addr1.getAddress())).to.equal(ethers.parseUnits("100", 18))
        })

        it("Should not allow non-owner to withdraw tokens", async function () {
            await expect(soulboundToken.connect(addr1).withdrawNativeToken(ethers.parseEther("1.0"), await addr1.getAddress())).to.be.revertedWith("Ownable: caller is not the owner")

            await expect(soulboundToken.connect(addr1).witdhrawERC20Token(await usdtToken.getAddress(), ethers.parseUnits("100", 18), await addr1.getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
})
