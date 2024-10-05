// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MaterialItem is Initializable, ERC1155Upgradeable, OwnableUpgradeable, ERC1155BurnableUpgradeable, UUPSUpgradeable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    uint256 public constant MAX_MATERIAL_ITEMS = 15;
    uint256 public constant EQUIPMENT_OFFSET = 15;
    uint256 public constant UPGRADE_REQUIREMENT = 3;

    struct ItemInfo {
        uint256 id;
        uint256 balance;
        string uri;
    }

    mapping(uint256 => string) private _tokenURIs;
    address public landContract;

    function initialize() initializer public {
        __ERC1155_init("https://token-cdn-domain/");
        __Ownable_init();
        __ERC1155Burnable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function setURI(uint256 tokenId, string memory newuri) public onlyOwner {
        _tokenURIs[tokenId] = newuri;
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function setLandContract(address _landContract) public onlyOwner {
        landContract = _landContract;
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public {
        // require(id < MAX_MATERIAL_ITEMS, "Can only mint material items");
        // require(msg.sender == owner() || msg.sender == landContract, "Not authorized to mint");
        require(id > 0, "Invalid material item ID");
        require(amount > 0, "Amount must be greater than 0");
        _tokenIds.increment();
        _mint(account, id, amount, data);
    }

    function upgradeMaterialToEquipment(uint256 materialId) public {
        require(materialId < MAX_MATERIAL_ITEMS, "Invalid material item ID");
        uint256 equipmentId = materialId + EQUIPMENT_OFFSET;
        
        require(balanceOf(msg.sender, materialId) >= UPGRADE_REQUIREMENT, "Insufficient material items for upgrade");

        // Burn the required amount of material items
        _burn(msg.sender, materialId, UPGRADE_REQUIREMENT);

        // Mint the upgraded equipment
        _mint(msg.sender, equipmentId, 1, "");
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        for (uint256 i = 0; i < ids.length; i++) {
            require(ids[i] < MAX_MATERIAL_ITEMS && ids[i] >= 0, "Can only mint material items");
        }
        _mintBatch(to, ids, amounts, data);
    }

    function getTokensOfOwner(address owner) public view returns (ItemInfo[] memory) {
        uint256 numberOfTokenTypes = MAX_MATERIAL_ITEMS + EQUIPMENT_OFFSET;
        ItemInfo[] memory ownedItems = new ItemInfo[](numberOfTokenTypes);

        for (uint256 i = 1; i <= numberOfTokenTypes; i++) {
            uint256 balance = balanceOf(owner, i);
            ownedItems[i-1] = ItemInfo({
                id: i,
                balance: balance,
                uri: uri(i)
            });
        }

        return ownedItems;
    }
}