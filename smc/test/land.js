const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("LandERC404", function () {
    let LandERC404
    let landContract
    let owner
    let addr1
    let addr2
    let addr3
    let materialItemContract

    beforeEach(async function () {
        ;[owner, addr1, addr2, addr3] = await ethers.getSigners()

        // Deploy mock MaterialItem contract
        const MaterialItem = await ethers.getContractFactory("MaterialItem")
        materialItemContract = await MaterialItem.deploy()
        await materialItemContract.waitForDeployment()

        // Deploy LandERC404 contract
        LandERC404 = await ethers.getContractFactory("LandERC404")
        landContract = await LandERC404.deploy("LandNFT", "LAND", 18, 10, await owner.getAddress(), await materialItemContract.getAddress())
        await landContract.waitForDeployment()

        // Set land contract in MaterialItem
        await materialItemContract.setLandContract(await landContract.getAddress())

        // Open minting
        await landContract.setOpenMint(true)
    })

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await landContract.owner()).to.equal(await owner.getAddress())
        })

        it("Should set the correct initial values", async function () {
            expect(await landContract.name()).to.equal("LandNFT")
            expect(await landContract.symbol()).to.equal("LAND")
            expect(await landContract.decimals()).to.equal(18)
            expect(await landContract.MAX_ERC721_MINT()).to.equal(10)
            expect(await landContract.recipient()).to.equal(await owner.getAddress())
            expect(await landContract.materialItemContract()).to.equal(await materialItemContract.getAddress())
        })
    })

    describe("Minting", function () {
        it("Should allow whitelisted addresses to mint for free", async function () {
            await landContract.addToAirdropWhitelist([addr1.address], [1])
            await landContract.connect(addr1).mintERC20()
            expect(await landContract.balanceOf(addr1.address)).to.equal(ethers.parseEther("1"))
        })

        it("Should allow public minting with payment", async function () {
            const mintPrice = await landContract.transferAmount()
            await landContract.connect(addr2).mintERC20({ value: mintPrice })
            expect(await landContract.balanceOf(addr2.address)).to.equal(ethers.parseEther("1"))
        })

        it("Should not allow minting when paused", async function () {
            await landContract.setOpenMint(false)
            const mintPrice = await landContract.transferAmount()
            await expect(landContract.connect(addr2).mintERC20({ value: mintPrice })).to.be.revertedWith("Mint is not open")
        })

        it("Should not allow minting more than MAX_MINT", async function () {
            const mintPrice = await landContract.transferAmount()
            const maxMint = await landContract.MAX_ERC721_MINT()

            const signers = await ethers.getSigners()
            for (let i = 0; i < maxMint; i++) {
                await landContract.connect(signers[i]).mintERC20({ value: mintPrice })
            }

            await expect(landContract.connect(signers[maxMint]).mintERC20({ value: mintPrice })).to.be.revertedWith("Max mint limit reached")
        })

        it("Should not allow minting twice from the same address", async function () {
            const mintPrice = await landContract.transferAmount()
            await landContract.connect(addr1).mintERC20({ value: mintPrice })
            await expect(landContract.connect(addr1).mintERC20({ value: mintPrice })).to.be.revertedWith("Already minted")
        })
    })

    describe("Whitelist Management", function () {
        it("Should add addresses to whitelist", async function () {
            await landContract.addToAirdropWhitelist([addr1.address, addr2.address], [1, 2])
            const [isWhitelisted1, amount1] = await landContract.isWhitelisted(addr1.address)
            const [isWhitelisted2, amount2] = await landContract.isWhitelisted(addr2.address)
            expect(isWhitelisted1).to.be.true
            expect(amount1).to.equal(1)
            expect(isWhitelisted2).to.be.true
            expect(amount2).to.equal(2)
        })

        it("Should remove addresses from whitelist", async function () {
            await landContract.addToAirdropWhitelist([addr1.address], [1])
            await landContract.removeFromAirdropWhitelist([addr1.address])
            const [isWhitelisted, amount] = await landContract.isWhitelisted(addr1.address)
            expect(isWhitelisted).to.be.false
            expect(amount).to.equal(0)
        })

        it("Should only allow owner to manage whitelist", async function () {
            await expect(landContract.connect(addr1).addToAirdropWhitelist([addr2.address], [1])).to.be.revertedWith("Ownable: caller is not the owner")
            await expect(landContract.connect(addr1).removeFromAirdropWhitelist([addr2.address])).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Material Item Claiming", function () {
        it("Should allow token owners to claim material items", async function () {
            const mintPrice = await landContract.transferAmount()
            await landContract.connect(addr1).mintERC20({ value: mintPrice })
            const balance = await landContract.balanceOf(addr1.address)
            expect(balance).to.equal(ethers.parseEther("1")) // Ensure the balance is correct

            // Loop through possible NFT IDs to find the one owned by addr1
            let nftId
            for (let i = 1; i <= (await landContract.minted()); i++) {
                if ((await landContract.ownerOf(i)) == addr1.address) {
                    nftId = i
                    break
                }
            }
            expect(nftId).to.equal(1)

            // Claim material item
            const tx = await landContract.connect(addr1).claimMaterialItem(nftId)
            const receipt = await tx.wait()
        })

        it("Should enforce cooldown period", async function () {
            const mintPrice = await landContract.transferAmount()
            await landContract.connect(addr1).mintERC20({ value: mintPrice })
            await landContract.connect(addr1).claimMaterialItem(1)
            await expect(landContract.connect(addr1).claimMaterialItem(1)).to.be.revertedWith("Cooldown period not elapsed")
        })

        it("Should only allow token owner to claim material items", async function () {
            const mintPrice = await landContract.transferAmount()
            await landContract.connect(addr1).mintERC20({ value: mintPrice })
            await expect(landContract.connect(addr2).claimMaterialItem(1)).to.be.revertedWith("You must own the NFT land")
        })
    })

    describe("ERC721 Transfer Exemption", function () {
        it("Should allow owner to set ERC721 transfer exemption", async function () {
            await landContract.setERC721TransferExempt(addr1.address, true)
            // You might need to add a public getter for this in your contract to test it
            // expect(await landContract.isERC721TransferExempt(addr1.address)).to.be.true;
        })

        it("Should only allow owner to set ERC721 transfer exemption", async function () {
            await expect(landContract.connect(addr1).setERC721TransferExempt(addr2.address, true)).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("URI Management", function () {
        it("Should allow owner to set new URI", async function () {
            const newURI = "https://newuri.com/"
            await landContract.setURI(newURI)
            expect(await landContract.tokenURI(1)).to.equal(newURI + "1")
        })

        it("Should not allow setting empty URI", async function () {
            await expect(landContract.setURI("")).to.be.revertedWith("URI cannot be empty")
        })

        it("Should only allow owner to set URI", async function () {
            await expect(landContract.connect(addr1).setURI("https://newuri.com/")).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })

    describe("Withdrawal", function () {
        it("Should not allow withdrawal of more than contract balance", async function () {
            const contractBalance = await ethers.provider.getBalance(await landContract.getAddress())
            await expect(landContract.withdrawNativeToken(contractBalance + 1n, await owner.getAddress())).to.be.revertedWith("transfer failed")
        })

        it("Should not allow withdrawal of zero amount", async function () {
            await expect(landContract.withdrawNativeToken(0, owner.address)).to.be.revertedWith("remove liquidity amount should be more than 0")
        })

        it("Should only allow owner to withdraw", async function () {
            await expect(landContract.connect(addr1).withdrawNativeToken(1, addr1.address)).to.be.revertedWith("Ownable: caller is not the owner")
        })
    })
})
