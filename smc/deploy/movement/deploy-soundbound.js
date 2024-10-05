const { ethers } = require("hardhat");

async function main() {
  const SoulboundERC20 = await ethers.getContractFactory("SoulboundERC20");
  
  const name = "Soundbound MEOW Token";
  const symbol = "sMEOW";
  const catNftAddress = "0x01f562A25d2da7158FEc675C8a926CB1c4faDF97" // Replace with actual address

  console.log("Deploying SoulboundERC20...");
  
  const soulboundToken = await SoulboundERC20.deploy(name, symbol, catNftAddress);

  await soulboundToken.waitForDeployment();

  console.log("SoulboundERC20 deployed to:", await soulboundToken.getAddress());

  await soulboundToken.addWhitelist(catNftAddress);
  await soulboundToken.mint(catNftAddress, 1000000000000000000000000000n);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });