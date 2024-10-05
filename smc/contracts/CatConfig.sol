// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CatConfig is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    using Strings for uint256;

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

    struct UpgradeBonus {
        uint256 attack;
        uint256 armor;
        uint256 attackSpeed;
        uint256 magic;
        uint256 manaPoint;
        uint256 healthPoint;
        uint256 criticalDamage;
        uint256 liveTime;
    }

    mapping(uint256 => CatType) private catTypes;
    uint256[] private catTypeList;

    mapping(uint256 => EquipmentBonus) private equipmentBonuses;
    uint256[] private equipmentBonusList;

    mapping(uint256 => UpgradeBonus) private upgradeBonuses;

    uint256 public constant MAX_CAT_TYPES = 10;
    uint256 public constant MAX_EQUIPMENT_TYPES = 10;
    uint256 public constant MAX_CAT_LEVEL = 5;

    event CatTypeAdded(uint256 catType);
    event CatTypeUpdated(uint256 catType);
    event CatTypeActivated(uint256 catType);
    event CatTypeDeactivated(uint256 catType);

    event EquipmentBonusAdded(uint256 equipmentId);
    event EquipmentBonusUpdated(uint256 equipmentId);
    event EquipmentBonusActivated(uint256 equipmentId);
    event EquipmentBonusDeactivated(uint256 equipmentId);

    event UpgradeBonusUpdated(uint256 level);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyOwner
        override
    {}

    // Cat Type functions
    function addCatType(
        uint256 catType,
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        string memory description,
        uint256 liveTime
    ) external onlyOwner {
        require(catType > 0, "Cat type cannot be zero");
        require(catTypes[catType].healthPoint == 0, "Cat type already exists");
        require(catTypeList.length < MAX_CAT_TYPES, "Maximum number of cat types reached");
        
        catTypes[catType] = CatType(
            attack,
            armor,
            attackSpeed,
            magic,
            manaPoint,
            healthPoint,
            criticalDamage,
            description,
            true,
            liveTime
        );
        catTypeList.push(catType);

        emit CatTypeAdded(catType);
    }

    function updateCatType(
        uint256 catType,
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        string memory description,
        uint256 liveTime
    ) external onlyOwner {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        
        catTypes[catType] = CatType(
            attack,
            armor,
            attackSpeed,
            magic,
            manaPoint,
            healthPoint,
            criticalDamage,
            description,
            catTypes[catType].isActive,
            liveTime
        );

        emit CatTypeUpdated(catType);
    }

    function getCatTypeConfig(uint256 catType) external view returns (CatType memory) {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        return catTypes[catType];
    }

    function activateCatType(uint256 catType) external onlyOwner {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        require(!catTypes[catType].isActive, "Cat type is already active");
        
        catTypes[catType].isActive = true;
        emit CatTypeActivated(catType);
    }

    function deactivateCatType(uint256 catType) external onlyOwner {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        require(catTypes[catType].isActive, "Cat type is already inactive");
        
        catTypes[catType].isActive = false;
        emit CatTypeDeactivated(catType);
    }

    function getAllCatTypes() external view returns (uint256[] memory) {
        return catTypeList;
    }

    function getActiveCatTypes() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < catTypeList.length; i++) {
            if (catTypes[catTypeList[i]].isActive) {
                activeCount++;
            }
        }

        uint256[] memory activeCatTypes = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < catTypeList.length; i++) {
            if (catTypes[catTypeList[i]].isActive) {
                activeCatTypes[index] = catTypeList[i];
                index++;
            }
        }

        return activeCatTypes;
    }

    function isCatTypeActive(uint256 catType) external view returns (bool) {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        return catTypes[catType].isActive;
    }

    function getCatTypeDescription(uint256 catType) external view returns (string memory) {
        require(catTypes[catType].healthPoint != 0, "Cat type does not exist");
        return catTypes[catType].description;
    }

    function getRandomActiveCatType(uint256 seed) external view returns (uint256) {
        uint256[] memory activeCatTypes = this.getActiveCatTypes();
        require(activeCatTypes.length > 0, "No active cat types");
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % activeCatTypes.length;
        return activeCatTypes[randomIndex];
    }

    // Equipment Bonus functions
    function addEquipmentBonus(
        uint256 equipmentId,
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        string memory description,
        uint256 liveTime
    ) external onlyOwner {
        require(equipmentId >= 10 && equipmentId <= 19, "Invalid equipment ID");
        require(equipmentBonuses[equipmentId].healthPoint == 0, "Equipment bonus already exists");
        require(equipmentBonusList.length < MAX_EQUIPMENT_TYPES, "Maximum number of equipment types reached");
        
        equipmentBonuses[equipmentId] = EquipmentBonus(
            attack,
            armor,
            attackSpeed,
            magic,
            manaPoint,
            healthPoint,
            criticalDamage,
            description,
            true,
            liveTime
        );
        equipmentBonusList.push(equipmentId);

        emit EquipmentBonusAdded(equipmentId);
    }

    function updateEquipmentBonus(
        uint256 equipmentId,
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        string memory description,
        uint256 liveTime
    ) external onlyOwner {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        
        equipmentBonuses[equipmentId] = EquipmentBonus(
            attack,
            armor,
            attackSpeed,
            magic,
            manaPoint,
            healthPoint,
            criticalDamage,
            description,
            equipmentBonuses[equipmentId].isActive,
            liveTime
        );

        emit EquipmentBonusUpdated(equipmentId);
    }

    function getEquipmentBonus(uint256 equipmentId) external view returns (EquipmentBonus memory) {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        return equipmentBonuses[equipmentId];
    }

    function activateEquipmentBonus(uint256 equipmentId) external onlyOwner {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        require(!equipmentBonuses[equipmentId].isActive, "Equipment bonus is already active");
        
        equipmentBonuses[equipmentId].isActive = true;
        emit EquipmentBonusActivated(equipmentId);
    }

    function deactivateEquipmentBonus(uint256 equipmentId) external onlyOwner {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        require(equipmentBonuses[equipmentId].isActive, "Equipment bonus is already inactive");
        
        equipmentBonuses[equipmentId].isActive = false;
        emit EquipmentBonusDeactivated(equipmentId);
    }

    function getAllEquipmentBonuses() external view returns (uint256[] memory) {
        return equipmentBonusList;
    }

    function getActiveEquipmentBonuses() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < equipmentBonusList.length; i++) {
            if (equipmentBonuses[equipmentBonusList[i]].isActive) {
                activeCount++;
            }
        }

        uint256[] memory activeEquipmentBonuses = new uint256[](activeCount);
        uint256 index = 0;
        for (uint256 i = 0; i < equipmentBonusList.length; i++) {
            if (equipmentBonuses[equipmentBonusList[i]].isActive) {
                activeEquipmentBonuses[index] = equipmentBonusList[i];
                index++;
            }
        }

        return activeEquipmentBonuses;
    }

    function isEquipmentBonusActive(uint256 equipmentId) external view returns (bool) {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        return equipmentBonuses[equipmentId].isActive;
    }

    function getEquipmentBonusDescription(uint256 equipmentId) external view returns (string memory) {
        require(equipmentBonuses[equipmentId].healthPoint != 0, "Equipment bonus does not exist");
        return equipmentBonuses[equipmentId].description;
    }

    function getMaxLevel() external pure returns (uint256) {
        return MAX_CAT_LEVEL;
    }

    // Upgrade Bonus functions
    function setUpgradeBonus(
        uint256 level,
        uint256 attack,
        uint256 armor,
        uint256 attackSpeed,
        uint256 magic,
        uint256 manaPoint,
        uint256 healthPoint,
        uint256 criticalDamage,
        uint256 liveTime
    ) external onlyOwner {
        require(level > 0 && level <= MAX_CAT_LEVEL, "Invalid level");
        
        upgradeBonuses[level] = UpgradeBonus(
            attack,
            armor,
            attackSpeed,
            magic,
            manaPoint,
            healthPoint,
            criticalDamage,
            liveTime
        );

        emit UpgradeBonusUpdated(level);
    }

    function getUpgradeBonus(uint256 level) external view returns (UpgradeBonus memory) {
        require(level > 0 && level <= MAX_CAT_LEVEL, "Invalid level");
        return upgradeBonuses[level];
    }
}