// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface ICatConfig {
    struct CatType {
        uint256 attack;
        uint256 armor;
        uint256 attackSpeed;
        uint256 magic;
        uint256 manaPoint;
        uint256 healthPoint;
        uint256 criticalDamage;
        string description;
        bool isActive;
        uint256 liveTime;
    }

    struct EquipmentBonus {
        uint256 attack;
        uint256 armor;
        uint256 attackSpeed;
        uint256 magic;
        uint256 manaPoint;
        uint256 healthPoint;
        uint256 criticalDamage;
        string description;
        bool isActive;
        uint256 liveTime;
    }

    function getCatTypeConfig(uint256 catType) external view returns (CatType memory);
    function getEquipmentBonus(uint256 equipmentId) external view returns (EquipmentBonus memory);
    function isCatTypeActive(uint256 catType) external view returns (bool);
    function isEquipmentBonusActive(uint256 equipmentId) external view returns (bool);
    function getUpgradeBonus(uint256 currentLevel) external view returns (
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        uint256 liveTime
    );
    function getMaxLevel() external view returns (uint256);
    function getRandomActiveCatType(uint256 seed) external view returns (uint256);
}

contract AdvancedDynamicCatNFT is Initializable, ERC721Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Strings for uint256;

    CountersUpgradeable.Counter private _tokenIds;

    uint256 public currentTimestamp;

    struct CatMetadata {
        uint256 catType;
        uint256 level;
        uint256 attack;
        uint256 armor;
        uint256 attackSpeed;
        uint256 magic;
        uint256 manaPoint;
        uint256 healthPoint;
        uint256 criticalDamage;
        uint256[] equippedItems;
        uint256 lastClaimTime;
        uint256 liveTime;
        uint256 dob;
    }

    struct CatItemInfo {
        uint256 catType;
        uint256 level;
        uint256 attack;
        uint256 armor;
        uint256 attackSpeed;
        uint256 magic;
        uint256 manaPoint;
        uint256 healthPoint;
        uint256 criticalDamage;
        uint256[] equippedItems;
        uint256 lastClaimTime;
        uint256 liveTime;
        uint256 catId;
        uint256 dob;
    }

    mapping(uint256 => CatMetadata) private _catMetadata;
    string private _baseURIextended;
    address public materialItemContractAddress;
    address public catConfigAddress;
    address public farmTokenAddress;

    // Add this mapping at the contract level
    mapping(address => bool) private _hasMintedFreeCat;

    event CatMinted(uint256 indexed catId, address owner, uint256 catType);
    event CatUpgraded(uint256 indexed remainingCatId, uint256 burnedCatId, uint256 newLevel);
    event EquipmentEquipped(uint256 indexed catId, uint256 equipmentId);
    event EquipmentUnequipped(uint256 indexed catId, uint256 equipmentId);
    event FarmClaimed(uint256 indexed catId, address owner, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory baseURI, address _materialItemContractAddress, address _catConfigAddress, address _farmTokenAddress) initializer public {
        __ERC721_init("AdvancedDynamicCatNFT", "ADCAT");
        __Ownable_init();
        __UUPSUpgradeable_init();

        _baseURIextended = baseURI;
        materialItemContractAddress = _materialItemContractAddress;
        catConfigAddress = _catConfigAddress;
        farmTokenAddress = _farmTokenAddress;
        currentTimestamp = block.timestamp;
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    function setCatConfigAddress(address _catConfigAddress) external onlyOwner {
        catConfigAddress = _catConfigAddress;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseURIextended = baseURI;
    }

    function setMaterialItemContractAddress(address _materialItemContractAddress) external onlyOwner {
        materialItemContractAddress = _materialItemContractAddress;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        CatMetadata memory catData = _catMetadata[tokenId];
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(
                baseURI,
                tokenId.toString(),
                "?type=", catData.catType.toString(),
                "&level=", catData.level.toString(),
                "&attack=", catData.attack.toString(),
                "&armor=", catData.armor.toString(),
                "&attackSpeed=", catData.attackSpeed.toString(),
                "&magic=", catData.magic.toString(),
                "&manaPoint=", catData.manaPoint.toString(),
                "&healthPoint=", catData.healthPoint.toString(),
                "&criticalDamage=", catData.criticalDamage.toString(),
                "&equippedItems=", _getEquippedItemsString(catData.equippedItems),
                "&liveTime=", catData.liveTime.toString(),
                "&dob=", catData.dob.toString()
            ))
            : "";
    }

    function _getEquippedItemsString(uint256[] memory equippedItems) internal pure returns (string memory) {
        if (equippedItems.length == 0) {
            return "none";
        }
        
        string memory result = equippedItems[0].toString();
        for (uint i = 1; i < equippedItems.length; i++) {
            result = string(abi.encodePacked(result, ",", equippedItems[i].toString()));
        }
        return result;
    }

    function mintFreeLevelZero() public returns (uint256) {
        require(!_hasMintedFreeCat[msg.sender], "You have already minted a free cat");
        require(balanceOf(msg.sender) == 0, "You already own a cat");

        uint256 catType = ICatConfig(catConfigAddress).getRandomActiveCatType(uint256(keccak256(abi.encodePacked(getCurrentTimestamp(), msg.sender))));
        require(ICatConfig(catConfigAddress).isCatTypeActive(catType), "Cat type is not active");

        _tokenIds.increment();
        uint256 newCatId = _tokenIds.current();
        _safeMint(msg.sender, newCatId);
        
        ICatConfig.CatType memory baseConfig = ICatConfig(catConfigAddress).getCatTypeConfig(catType);
        
        _catMetadata[newCatId] = CatMetadata({
            catType: catType,
            level: 0,
            attack: baseConfig.attack / 2,
            armor: baseConfig.armor / 2,
            attackSpeed: baseConfig.attackSpeed / 2,
            magic: baseConfig.magic / 2,
            manaPoint: baseConfig.manaPoint / 2,
            healthPoint: baseConfig.healthPoint / 2,
            criticalDamage: baseConfig.criticalDamage / 2,
            equippedItems: new uint256[](0),
            lastClaimTime: getCurrentTimestamp(),
            liveTime:  getCurrentTimestamp() + 60 * 60 * 24 * 7, // 7 days
            dob: getCurrentTimestamp()
        });
        
        // Mark that this address has minted a free cat
        _hasMintedFreeCat[msg.sender] = true;
        
        emit CatMinted(newCatId, msg.sender, catType);
        return newCatId;
    }

    function mint() public returns (uint256) {
        uint256 catType = ICatConfig(catConfigAddress).getRandomActiveCatType(uint256(keccak256(abi.encodePacked(getCurrentTimestamp(), msg.sender))));
        require(ICatConfig(catConfigAddress).isCatTypeActive(catType), "Cat type is not active");

        _tokenIds.increment();
        uint256 newCatId = _tokenIds.current();
        _safeMint(msg.sender, newCatId);
        
        ICatConfig.CatType memory baseConfig = ICatConfig(catConfigAddress).getCatTypeConfig(catType);
        
        _catMetadata[newCatId] = CatMetadata({
            catType: catType,
            level: 1,
            attack: baseConfig.attack,
            armor: baseConfig.armor,
            attackSpeed: baseConfig.attackSpeed,
            magic: baseConfig.magic,
            manaPoint: baseConfig.manaPoint,
            healthPoint: baseConfig.healthPoint,
            criticalDamage: baseConfig.criticalDamage,
            equippedItems: new uint256[](0),
            lastClaimTime: getCurrentTimestamp(),
            liveTime: getCurrentTimestamp() + baseConfig.liveTime,
            dob: getCurrentTimestamp()
        });
        
        emit CatMinted(newCatId, msg.sender, catType);
        return newCatId;
    }

    function getCatMetadata(uint256 catId) public view returns (CatMetadata memory) {
        require(_exists(catId), "Cat does not exist");
        return _catMetadata[catId];
    }

    function _isValidEquipmentForCatType(uint256 catId, uint256 equipmentId) internal view returns (bool) {
        uint256 catType = _catMetadata[catId].catType;
        
        if (catType == 1) {
            return equipmentId == 16 || equipmentId == 17 || equipmentId == 18;
        } else if (catType == 2) {
            return equipmentId == 19 || equipmentId == 20 || equipmentId == 21;
        } else if (catType == 3) {
            return equipmentId == 22 || equipmentId == 23 || equipmentId == 24;
        } else if (catType == 4) {
            return equipmentId == 25 || equipmentId == 26 || equipmentId == 27;
        } else if (catType == 5) {
            return equipmentId == 28 || equipmentId == 29 || equipmentId == 30;
        }
        
        return false; // Invalid cat type
    }

    function equipItem(uint256 catId, uint256 equipmentId) public {
        require(_catMetadata[catId].level > 0, "Cat is not active");
        require(_catMetadata[catId].liveTime > getCurrentTimestamp(), "Cat has expired");
        require(_exists(catId), "Cat does not exist");
        require(ownerOf(catId) == msg.sender, "You don't own this cat");
        require(_isValidEquipmentForCatType(catId, equipmentId), "Invalid equipment for this cat type");
        require(ICatConfig(catConfigAddress).isEquipmentBonusActive(equipmentId), "Equipment is not active");

        IERC1155 materialItemContract = IERC1155(materialItemContractAddress);
        require(materialItemContract.balanceOf(msg.sender, equipmentId) > 0, "You don't own this equipment");

        materialItemContract.safeTransferFrom(msg.sender, address(this), equipmentId, 1, "");

        _catMetadata[catId].equippedItems.push(equipmentId);
        _applyEquipmentBonus(catId, equipmentId);

        emit EquipmentEquipped(catId, equipmentId);
    }

    function unequipItem(uint256 catId, uint256 equipmentId) public {
        require(_exists(catId), "Cat does not exist");
        CatMetadata storage cat = _catMetadata[catId];
        require(cat.level > 0, "Cat is not active");
        require(cat.liveTime > getCurrentTimestamp(), "Cat has expired");
        require(ownerOf(catId) == msg.sender, "You don't own this cat");
        uint256 equipmentIndex = type(uint256).max;

        for (uint256 i = 0; i < cat.equippedItems.length; i++) {
            if (cat.equippedItems[i] == equipmentId) {
                equipmentIndex = i;
                break;
            }
        }

        require(equipmentIndex != type(uint256).max, "Equipment not found on this cat");

        // Remove the equipment
        cat.equippedItems[equipmentIndex] = cat.equippedItems[cat.equippedItems.length - 1];
        cat.equippedItems.pop();

        // Remove the equipment bonus
        _removeEquipmentBonus(catId, equipmentId);

        // Transfer the equipment back to the owner
        IERC1155(materialItemContractAddress).safeTransferFrom(address(this), msg.sender, equipmentId, 1, "");

        emit EquipmentUnequipped(catId, equipmentId);
    }

    function _applyEquipmentBonus(uint256 catId, uint256 equipmentId) internal {
        CatMetadata storage cat = _catMetadata[catId];
        ICatConfig.EquipmentBonus memory bonus = ICatConfig(catConfigAddress).getEquipmentBonus(equipmentId);

        cat.attack += bonus.attack;
        cat.armor += bonus.armor;
        cat.attackSpeed += bonus.attackSpeed;
        cat.magic += bonus.magic;
        cat.manaPoint += bonus.manaPoint;
        cat.healthPoint += bonus.healthPoint;
        cat.criticalDamage += bonus.criticalDamage;
        cat.liveTime += bonus.liveTime;
    }

    function _removeEquipmentBonus(uint256 catId, uint256 equipmentId) internal {
        CatMetadata storage cat = _catMetadata[catId];
        ICatConfig.EquipmentBonus memory bonus = ICatConfig(catConfigAddress).getEquipmentBonus(equipmentId);

        cat.attack -= bonus.attack;
        cat.armor -= bonus.armor;
        cat.attackSpeed -= bonus.attackSpeed;
        cat.magic -= bonus.magic;
        cat.manaPoint -= bonus.manaPoint;
        cat.healthPoint -= bonus.healthPoint;
        cat.criticalDamage -= bonus.criticalDamage;
        cat.liveTime -= bonus.liveTime;
    }

    // Implement ERC1155Receiver
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    function upgradeCat(uint256 catId1, uint256 catId2) public {
        require(_exists(catId1) && _exists(catId2), "Both cats must exist");
        require(ownerOf(catId1) == msg.sender && ownerOf(catId2) == msg.sender, "You must own both cats");
        require(_catMetadata[catId1].level == _catMetadata[catId2].level, "Cats must be the same level");
        require(_catMetadata[catId1].level > 0, "Cat is not active");
        
        uint256 maxLevel = ICatConfig(catConfigAddress).getMaxLevel();
        require(_catMetadata[catId1].level < maxLevel, "Cats are already at max level");

        CatMetadata storage cat1 = _catMetadata[catId1];
        CatMetadata storage cat2 = _catMetadata[catId2];
        
        uint256 newLevel = cat1.level + 1;
        
        // Get base config for the new level
        ICatConfig.CatType memory baseConfig = ICatConfig(catConfigAddress).getCatTypeConfig(cat1.catType);
        
        // Get upgrade bonus from ICatConfig
        (
            uint256 attackBonus,
            uint256 armorBonus,
            uint256 attackSpeedBonus,
            uint256 magicBonus,
            uint256 manaPointBonus,
            uint256 healthPointBonus,
            uint256 criticalDamageBonus,
            uint256 liveTimeBonus
        ) = ICatConfig(catConfigAddress).getUpgradeBonus(cat1.level);

        // Apply upgrades
        cat1.level = newLevel;
        cat1.attack = baseConfig.attack + attackBonus;
        cat1.armor = baseConfig.armor + armorBonus;
        cat1.attackSpeed = baseConfig.attackSpeed + attackSpeedBonus;
        cat1.magic = baseConfig.magic + magicBonus;
        cat1.manaPoint = baseConfig.manaPoint + manaPointBonus;
        cat1.healthPoint = baseConfig.healthPoint + healthPointBonus;
        cat1.criticalDamage = baseConfig.criticalDamage + criticalDamageBonus;
        cat1.liveTime = baseConfig.liveTime + liveTimeBonus;

        // Transfer equipped items from cat2 to cat1
        for (uint i = 0; i < cat2.equippedItems.length; i++) {
            uint256 equipmentId = cat2.equippedItems[i];
            if (!_isEquipmentTypeEquipped(catId1, equipmentId)) {
                cat1.equippedItems.push(equipmentId);
                _applyEquipmentBonus(catId1, equipmentId);
            }
        }

        // Burn the second cat
        _burn(catId2);
        
        emit CatUpgraded(catId1, catId2, newLevel);
    }

    function _isEquipmentTypeEquipped(uint256 catId, uint256 equipmentId) internal view returns (bool) {
        ICatConfig.EquipmentBonus memory newEquipment = ICatConfig(catConfigAddress).getEquipmentBonus(equipmentId);
        for (uint i = 0; i < _catMetadata[catId].equippedItems.length; i++) {
            ICatConfig.EquipmentBonus memory equippedItem = ICatConfig(catConfigAddress).getEquipmentBonus(_catMetadata[catId].equippedItems[i]);
            if (keccak256(bytes(equippedItem.description)) == keccak256(bytes(newEquipment.description))) {
                return true;
            }
        }
        return false;
    }

    function calculateFarmRate(
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        uint256 catType
    ) internal pure returns (uint256) {
        if (catType == 1) { // knight
            return (11 * attack + 12 * armor + 11 * attackSpeed + 12 * magic + 12 * manaPoint + 11 * healthPoint + 12 * criticalDamage);
        } else if (catType == 2) { // archer
            return (12 * attack + 11 * armor + 13 * attackSpeed + 11 * magic + 11 * manaPoint + 11 * healthPoint + 12 * criticalDamage);
        } else if (catType == 3) { // mage
            return (13 * attack + 11 * armor + 12 * attackSpeed + 14 * magic + 12 * manaPoint + 11 * healthPoint + 11 * criticalDamage);
        } else if (catType == 4) { // priest
            return (11 * attack + 12 * armor + 11 * attackSpeed + 12 * magic + 13 * manaPoint + 13 * healthPoint + 11 * criticalDamage);
        } else if (catType == 5) { // assassin
            return (13 * attack + 11 * armor + 13 * attackSpeed + 11 * magic + 11 * manaPoint + 11 * healthPoint + 12 * criticalDamage);
        } else {
            revert("Invalid cat type");
        }
    }

    function getCurrentTimestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    function setCurrentTimestamp(uint256 timestamp) public onlyOwner {
        currentTimestamp = timestamp;
    }

    function claimFarmTokens(uint256 catId) public {
        require(_exists(catId), "Cat does not exist");
        require(ownerOf(catId) == msg.sender, "You don't own this cat");
        require(_catMetadata[catId].liveTime > getCurrentTimestamp(), "Cat has expired");

        CatMetadata storage cat = _catMetadata[catId];
        uint256 timePassed = getCurrentTimestamp() - cat.lastClaimTime;
        
        uint256 farmRate = calculateFarmRate(
            cat.attack,
            cat.armor,
            cat.attackSpeed,
            cat.magic,
            cat.manaPoint,
            cat.healthPoint,
            cat.criticalDamage,
            cat.catType
        );
        
        uint256 tokensEarned = (timePassed * farmRate); // Tokens earned per second

        require(tokensEarned > 0, "No tokens to claim");

        cat.lastClaimTime = getCurrentTimestamp();

        IERC20(farmTokenAddress).transfer(msg.sender, tokensEarned * 10 ** 9);

        emit FarmClaimed(catId, msg.sender, tokensEarned * 10 ** 9);
    }

    function claimBatchFarmTokens(uint256[] memory catIds) public {
        uint256 totalTokensEarned = 0;

        for (uint256 i = 0; i < catIds.length; i++) {
            uint256 catId = catIds[i];
            require(_exists(catId), "Cat does not exist");
            require(ownerOf(catId) == msg.sender, "You don't own this cat");
            require(_catMetadata[catId].liveTime > getCurrentTimestamp(), "Cat has expired");

            CatMetadata storage cat = _catMetadata[catId];
            uint256 timePassed = getCurrentTimestamp() - cat.lastClaimTime;
            
            uint256 farmRate = calculateFarmRate(
                cat.attack,
                cat.armor,
                cat.attackSpeed,
                cat.magic,
                cat.manaPoint,
                cat.healthPoint,
                cat.criticalDamage,
                cat.catType
            );

            require(timePassed > 0, 'time passed invalid');
            
            uint256 tokensEarned = timePassed * farmRate;

            if (tokensEarned > 0) {
                totalTokensEarned += tokensEarned;
                cat.lastClaimTime = getCurrentTimestamp();
                emit FarmClaimed(catId, msg.sender, tokensEarned * 10 ** 9);
            }
        }

        require(totalTokensEarned > 0, "No tokens to claim");

        IERC20(farmTokenAddress).transfer(msg.sender, totalTokensEarned * 10 ** 9);
    }

    function getTokensOfOwner(address owner) public view returns (CatItemInfo[] memory) {
        uint256 tokenCount = balanceOf(owner);
        if (tokenCount == 0) {
            return new CatItemInfo[](0);
        }

        CatItemInfo[] memory ownedCats = new CatItemInfo[](tokenCount);
        uint256 currentId = 1;
        uint256 currentIndex = 0;
        uint256 totalSupply = _tokenIds.current();

        while(currentIndex < tokenCount && currentId <= totalSupply){
            if (_exists(currentId) && ownerOf(currentId) == owner) {
                CatMetadata memory catData = _catMetadata[currentId];
                ownedCats[currentIndex] = CatItemInfo({
                    catType: catData.catType,
                    level: catData.level,
                    attack: catData.attack,
                    armor: catData.armor,
                    attackSpeed: catData.attackSpeed,
                    magic: catData.magic,
                    manaPoint: catData.manaPoint,
                    healthPoint: catData.healthPoint,
                    criticalDamage: catData.criticalDamage,
                    equippedItems: catData.equippedItems,
                    lastClaimTime: catData.lastClaimTime,
                    liveTime: catData.liveTime,
                    catId: currentId,
                    dob: catData.dob
                });
                currentIndex++;
            }


            currentId++;
        }

        return ownedCats;
    }

    function setfarmContract(address _farmTokenAddress) public onlyOwner {
        farmTokenAddress = _farmTokenAddress;
    }

    function setCatConfigContract(address _catConfigAddress) public onlyOwner {
        catConfigAddress = _catConfigAddress;
    }

    function setMaterialContract(address _materialItemContractAddress) public onlyOwner {
        materialItemContractAddress = _materialItemContractAddress;
    }
}