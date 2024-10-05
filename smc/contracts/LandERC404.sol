//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ERC404} from "./ERC404.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IMaterialItem} from "./interfaces/IMaterialItem.sol";

contract LandERC404 is Ownable, ERC404 {
  event MaterialItemClaimed(address indexed user, uint256 materialItemId);
  constructor(
    string memory name_,
    string memory symbol_,
    uint8 decimals_,
    uint256 maxMint_,
    address _recipient,
    address _materialItemContract
  ) ERC404(name_, symbol_, decimals_) Ownable() {
    MAX_MINT = maxMint_ * 10 ** decimals;
    MAX_ERC721_MINT= maxMint_;
    recipient = _recipient;
    materialItemContract = IMaterialItem(_materialItemContract);
  }

  // New variables and mappings for material item claiming
    IMaterialItem public materialItemContract;
    uint256 public constant CLAIM_COOLDOWN = 900; // 15 minutes
    mapping(uint256 => uint256) public lastClaimTime;

  // Mapping to keep track of whether an address has minted
    mapping(address => bool) private hasMintedMap;
    uint256 public publicMinted = 0;
    uint256 public MAX_MINT;
    uint256 public MAX_ERC721_MINT;
    // Address to receive the transferred funds
    address public recipient;

    uint256 public whitelisted = 0;
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public whitelistAmount;
    mapping(address => bool) private hasMintedWhitelistMap;

    bool public isOpenMint = false;

    // URI for the token metadata
    string private URI = "https://nftstorage.link/ipfs/xxx/";

    // Amount to be transferred (0.0018 ETH in this case)
    uint256 public transferAmount = 0.0001 ether;

    // Events for tracking whitelist changes
    event WhitelistAdded(address indexed account, uint256 amount);
    event WhitelistRemoved(address indexed account);
    event Minted(address indexed account, uint256 tokenId);

    function tokenURI(uint256 id_) public view override returns (string memory) {
    // Concatenate the base URI with the token ID using Strings.toString
    return string.concat(URI, Strings.toString(id_));
    }

    function setERC721TransferExempt(
      address account_,
      bool value_
    ) external onlyOwner {
      _setERC721TransferExempt(account_, value_);
    }

    // Function to add multiple addresses to the whitelist in one transaction
    // Takes an array of addresses to be whitelisted
    function addToAirdropWhitelist(address[] calldata addresses, uint256[] calldata amount) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            if(!whitelist[addresses[i]]) {
              whitelisted++;
            }
            whitelist[addresses[i]] = true;
            whitelistAmount[addresses[i]] = amount[i];
            hasMintedWhitelistMap[addresses[i]] = false;
            emit WhitelistAdded(addresses[i], amount[i]);
        }
    }

    // Function to remove addresses from the whitelist
    // Takes an array of addresses to be removed
    function removeFromAirdropWhitelist(address[] calldata addresses) external onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            if (whitelist[addresses[i]]) {
                whitelist[addresses[i]] = false;
                whitelistAmount[addresses[i]] = 0;
                emit WhitelistRemoved(addresses[i]);
            }
        }
    }

    function updateTransferAmount(uint256 _newAmount) public onlyOwner {
        transferAmount = _newAmount;
    }

    function mintERC20() external payable {
      require(isOpenMint, "Mint is not open");
      require(totalSupply < MAX_MINT, "Max mint limit reached");
      require(!hasMintedMap[msg.sender], "Already minted");
      if (whitelist[msg.sender]) {
        _mintERC20(msg.sender, 1 * 10 ** decimals);
      } else {
        // Logic for public minting with payment
        require(publicMinted < MAX_ERC721_MINT - whitelisted, "Max public mint limit reached");
        require(msg.value == transferAmount, "Must send the exact amount");

        // Transfer funds to recipient
        (bool success,) = payable(recipient).call{value: transferAmount}("");

        // Check if transfer succeeded
        require(success, "Transfer failed");
        _mintERC20(msg.sender, 1 * 10 ** decimals);
        publicMinted++;
      }

      hasMintedMap[msg.sender] = true;
      emit Minted(msg.sender, minted);
    }

    function setURI(string memory newURI) public onlyOwner {
      require(bytes(newURI).length > 0, "URI cannot be empty");
      URI = newURI;
    }

    // Check if user is whitelisted
    function isWhitelisted(address account) public view returns (bool, uint256) {
      return (whitelist[account], whitelistAmount[account]);
    }

    // Check if user has minted 
    function hasMinted(address account) public view returns (bool) {
        return hasMintedMap[account];
    }

    // Check if user has minted whitelist 
    function hasMintedWhitelist(address account) public view returns (bool) {
      if(whitelist[account]){
        return hasMintedWhitelistMap[account];
      }

      return false;
    }

    function withdrawNativeToken(uint256 _amount, address _receiver) external onlyOwner {
        uint balance = address(this).balance;
        require(_amount <= balance,"transfer failed");
        require(_amount > 0, "remove liquidity amount should be more than 0");   
        payable(_receiver).transfer(_amount);
    }

    function setOpenMint(bool _state) external onlyOwner {
      isOpenMint = _state;
    }

  function claimMaterialItem(uint256 tokenId) external {
    require(ownerOf(tokenId) == msg.sender, "You must own the NFT land");
    require(block.timestamp >= lastClaimTime[tokenId] + CLAIM_COOLDOWN, "Cooldown period not elapsed");

    // Generate a random NFT ID for the material item
    uint256 materialItemId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, tokenId))) % 10; // 0-9 for material items

    // Mint the ERC1155 token to the caller
    materialItemContract.mint(msg.sender, materialItemId, 1, "");

    // Update the last claim time
    lastClaimTime[tokenId] = block.timestamp;

    emit MaterialItemClaimed(msg.sender, materialItemId);
  }

  // Function to set the material item contract address (onlyOwner for security)
  function setMaterialItemContract(address _newContract) external onlyOwner {
    materialItemContract = IMaterialItem(_newContract);
  }
}
