const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Marketplace", function () {
  let Erc404ContractFactory;
  let MarketplaceContractFactory;
  let erc404Contract;
  let marketplaceContract
  let owner;
  let addr1;
  let addr2;
  let addrs;
  const denom = 10 ** 18;
  const decimal = 18;

  before(async function () {
    Erc404ContractFactory = await ethers.getContractFactory("LandERC404");
    MarketplaceContractFactory = await ethers.getContractFactory("MockMarketplaceV2");
  });
  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, ...addrs] =
      await ethers.getSigners();
      erc404Contract = await Erc404ContractFactory.deploy(
        "Land ERC404",
        "LANDERC404",
        18,
        3333,
        await addr1.getAddress()
    );
    await erc404Contract.waitForDeployment();

    marketplaceContract = await upgrades.deployProxy(
      MarketplaceContractFactory,
      [10, ethers.parseEther("0.001"), ethers.parseEther("0.001")],
    );
    marketplaceContract = await MarketplaceContractFactory.deploy(
        10, ethers.parseEther("0.001"),ethers.parseEther("0.001")
    );
    await marketplaceContract.waitForDeployment();

    await erc404Contract.connect(owner).setOpenMint(true);
    await erc404Contract.connect(owner).addToWhitelist([await owner.getAddress()]);
    await erc404Contract.connect(owner).mintERC20({value: ethers.parseEther("0")});
    await marketplaceContract.connect(owner).setCollectionOwner(await erc404Contract.getAddress(), await owner.getAddress());
    await marketplaceContract.connect(owner).setMinSlip(await erc404Contract.getAddress(), 100000000000);
    await marketplaceContract.connect(owner).setRoyaltyConfig(await erc404Contract.getAddress(), 10, await owner.getAddress());
  });

  describe("Buy Sell", function () {
    it("create market item", async function () {
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 1);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 1, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft = await erc404Contract.ownerOf(1);
        expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

        await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
        expect(contractBalance).to.equal(ethers.parseEther("0.1"));
    });

    it("create market item and cancel", async function () {
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 2);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 2, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft = await erc404Contract.ownerOf(2);
      expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

        await marketplaceContract.connect(owner).cancelMarketItem(await erc404Contract.getAddress(), 0, {
            value: ethers.parseEther("0.001")
        });

      await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
      await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), {
          value: ethers.parseEther("0.001")
      });

      const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("0.1"));

        await marketplaceContract.connect(owner).cancelMarketItem(await erc404Contract.getAddress(), 0, {
            value: ethers.parseEther("0.001")
        });

        const contractAfterBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
        expect(contractAfterBalance).to.equal(ethers.parseEther("0"));
    });

    it("create market item and buy", async function () {
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 3);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 3, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft = await erc404Contract.ownerOf(3);
      expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

      await marketplaceContract.connect(addr1).createMarketSale(await erc404Contract.getAddress(), 0, {
        value: ethers.parseEther("0.0001")
        });

        const ownerOfNftAfterSale = await erc404Contract.ownerOf(3);
        expect(ownerOfNftAfterSale).to.equal(await addr1.getAddress());
      await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
      await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), {
          value: ethers.parseEther("0.001")
      });

      const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
      expect(contractBalance).to.equal(ethers.parseEther("0.1"));

        await marketplaceContract.connect(owner).createMarketSale(await erc404Contract.getAddress(), 0, {
            value: ethers.parseEther("0.0001")
        });
    });

    it("create batch market item and buy item has been sell", async function () {
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 1);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 1, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft1 = await erc404Contract.ownerOf(1);
        expect(ownerOfNft1).to.equal(await marketplaceContract.getAddress());

        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 2);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 2, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft2 = await erc404Contract.ownerOf(1);
        expect(ownerOfNft2).to.equal(await marketplaceContract.getAddress());

        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 3);
        await marketplaceContract.connect(owner).createMarketItem(await erc404Contract.getAddress(), 3, ethers.parseEther("1"), ethers.parseEther("0.0001"), {
            value: ethers.parseEther("0.001")
        });

        const ownerOfNft3 = await erc404Contract.ownerOf(3);
        expect(ownerOfNft3).to.equal(await marketplaceContract.getAddress());

        await marketplaceContract.connect(addr1).createMarketSale(await erc404Contract.getAddress(), 0, {
            value: ethers.parseEther("0.0001")
        });

        const ownerOfNft1AfterSale = await erc404Contract.ownerOf(1);
        expect(ownerOfNft1AfterSale).to.equal(await addr1.getAddress());

        await expect(
            await marketplaceContract.connect(addr2).createMarketSale(await erc404Contract.getAddress(), 0, {
                value: ethers.parseEther("0.0001")
            })
        ).to.be.reverted;
    });
  });

  describe("auction", function () {

    it("create auction", async function () {
        await marketplaceContract.setCurrentTime(Date.now());
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 4);
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 4, ethers.parseEther("1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });
        const ownerOfNft = await erc404Contract.ownerOf(4);
      expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

          await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });

        const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
        expect(contractBalance).to.equal(ethers.parseEther("0.1"));
    });

    it("create auction and cancel", async function () {
        await marketplaceContract.setCurrentTime(Date.now());
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 4);
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 4, ethers.parseEther("1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });
        const ownerOfNft = await erc404Contract.ownerOf(4);
      expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

          await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });

        const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
        expect(contractBalance).to.equal(ethers.parseEther("0.1"));

      await marketplaceContract.connect(owner).cancelAuction(await erc404Contract.getAddress(), 0, {
        value: ethers.parseEther("0.001")
      });


      const contractAfterBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
      expect(contractAfterBalance).to.equal(ethers.parseEther("0"));
    });


    it("create auction, bid and claim nft", async function () {
      await marketplaceContract.setCurrentTime(Date.now());
        await erc404Contract.connect(owner).erc721Approve(await marketplaceContract.getAddress(), 5);
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 5, ethers.parseEther("1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });
        const ownerOfNft = await erc404Contract.ownerOf(5);
      expect(ownerOfNft).to.equal(await marketplaceContract.getAddress());

      await marketplaceContract.connect(addr1).bid(0, {
        value: ethers.parseEther("1")
      });

      await marketplaceContract.setCurrentTime(Date.now() + 1000 * 60 * 60 + 1);
        await marketplaceContract.connect(addr1).claimNFT(0);

        const ownerOfNftAfterAuctionEnd = await erc404Contract.ownerOf(5);
        expect(ownerOfNftAfterAuctionEnd).to.equal(await addr1.getAddress());

                await erc404Contract.connect(owner).erc20Approve(await marketplaceContract.getAddress(), ethers.parseEther("0.1"));
        await marketplaceContract.connect(owner).createAuction(await erc404Contract.getAddress(), 1, ethers.parseEther("0.1"), ethers.parseEther("0.0001"), Date.now() + 1000 * 60 * 60, {
            value: ethers.parseEther("0.001")
        });

        const contractBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
        expect(contractBalance).to.equal(ethers.parseEther("0.1"));

      await marketplaceContract.connect(addr1).bid(0, {
        value: ethers.parseEther("0.01")
      });

      await marketplaceContract.setCurrentTime(Date.now() + 1000 * 60 * 60 + 100);
      await marketplaceContract.connect(addr1).claimNFT(0);

      const contractAfterBalance = await erc404Contract.erc20BalanceOf(await marketplaceContract.getAddress());
      expect(contractAfterBalance).to.equal(ethers.parseEther("0"));
    });
  });
});