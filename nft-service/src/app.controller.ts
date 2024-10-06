import { Controller, Get, Param, Query } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Controller("")
export class AppController {
    private catTypeConfig = ["knight","archer", "mage", "priest", "assassin"]
    private materialItemConfig: any = {
        1: "Sword Fragment",
        2: "Shield Fragment", 
        3: "Armor Fragment",
        4: "Bow Fragment", 
        5: "Arrow Fragment", 
        6: "Glove Fragment",
        7: "Scepter Fragment", 
        8: "Book Fragment", 
        9: "Witch's Hat Fragment",
        10: "Orb Fragment", 
        11: "Potion Fragment", 
        12: "Circlet Fragment",
        13: "Dagger Fragment", 
        14: "Cloak Fragment", 
        15: "Boots Fragment"
    }

    private equipmentConfig: any = {
        16:  {
            name: "Sword",
            attributes: [
            {
                "trait_type": "attack", 
                "value": 10
            },
            {
                "trait_type": "armor", 
                "value": 10
            },
            {
                "trait_type": "attackSpeed", 
                "value": 10
            },
            {
                "trait_type": "magic", 
                "value": 10
            },
            {
                "trait_type": "manaPoint", 
                "value": 10
            },
            {
                "trait_type": "healthPoint", 
                "value": 10
            },
            {
                "trait_type": "criticalDamage", 
                "value": 10
            }]
        },
        17: {
            name: "Shield", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]
        },
        18: {name: "Armor",
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]
        },
        19: {name: "Bow", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]
        },
        20: {name: "Arrow", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]
        },
        21: {name: "Glove",
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        22: {name: "Scepter", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        23: {name: "Book", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        24: {name: "Witch's Hat",
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        25: {name: "Orb", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        26: { name:"Potion", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        27: {name: "Circlet",
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        28: {name: "Dagger", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        29: {name: "Cloak", 
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]},
        30: {name: "Boots",
            attributes: [
                {
                    "trait_type": "attack", 
                    "value": 10
                },
                {
                    "trait_type": "armor", 
                    "value": 10
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": 10
                },
                {
                    "trait_type": "magic", 
                    "value": 10
                },
                {
                    "trait_type": "manaPoint", 
                    "value": 10
                },
                {
                    "trait_type": "healthPoint", 
                    "value": 10
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": 10
                }]}
    }

    constructor(private readonly configService: ConfigService) {}

    @Get()
    start() {
        return {
            statusCode: 200,
            data: new Date().toISOString() + " - VERSION: " + this.configService.get<string>("VERSION")
        }
    }

    @Get("metadata/cat/:tokenId")
    getNftCatMetadata(@Param("tokenId") tokenId: string, @Query() query: any) {
        return {
            name: `Meowster Hero NFT #${tokenId}`,
            description: "Meowster Hero is the primary NFT system in Meowtopia, designed to provide players with an immersive experience of battling, nurturing, and collecting tokens",
            image: `https://jellyfish-app-qjqp9.ondigitalocean.app/cat-${this.catTypeConfig[query.type - 1]}.png`,
            attributes: [
                {
                    "trait_type": "type", 
                    "value": query.type
                },
                {
                    "trait_type": "level", 
                    "value": query.level
                },
                {
                    "trait_type": "attack", 
                    "value": query.attack
                },
                {
                    "trait_type": "armor", 
                    "value": query.armor
                },
                {
                    "trait_type": "attackSpeed", 
                    "value": query.attackSpeed
                },
                {
                    "trait_type": "magic", 
                    "value": query.magic
                },
                {
                    "trait_type": "manaPoint", 
                    "value": query.manaPoint
                },
                {
                    "trait_type": "healthPoint", 
                    "value": query.healthPoint
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": query.criticalDamage
                },
                {
                    "trait_type": "equippedItems", 
                    "value": query.equippedItems
                },
                {
                    "trait_type": "liveTime", 
                    "value": query.liveTime
                },              {
                    "trait_type": "dob", 
                    "value": query.dob
                },
                {
                    "trait_type": "criticalDamage", 
                    "value": query.criticalDamage
                }]
        }
    }

    @Get("metadata/material/:tokenId")
    getNftMaterialMetadata(@Param("tokenId") tokenId: string) {
        if(Number(tokenId) <= 15) {
            return {
                name: `${this.materialItemConfig[tokenId]}`,
                description: "Material item nft is used to cast into equipment nft.",
                image: `https://jellyfish-app-qjqp9.ondigitalocean.app/materia-${tokenId}.png`,
                attributes: [{ value: tokenId}]
            }
        }else {
            return {
                name: `${this.equipmentConfig[tokenId].name}`,
                description: "Equipment NFT is used to attach to nft mews hero. Equipping NFT Items will also increase the stats by a certain percentage",
                image: `https://jellyfish-app-qjqp9.ondigitalocean.app/materia-${Number(tokenId) - 15}.png`,
                attributes: [this.equipmentConfig[tokenId].attributes]
            }
        }
    }

    // @Get("metadata/land/:tokenId.:ext")
    // getNftLandMetadata(@Param("tokenId") tokenId: string) {
    //     return {
    //         name: `Voucher 10000 CATGM #${tokenId}`,
    //         description: "After the token generation event, you can exchange this NFT Voucher for $CATGM tokens.",
    //         image: `https://nft.catgoldminer.ai/catgm-voucher-item.png`,
    //         attributes: [{ value: "10000" }]
    //     }
    // }

    // @Get("metadata/soundbound/smeow")
    // getTokenSoundboundMetadata(@Param("tokenId") tokenId: string) {
    //     return {
    //         name: `Voucher 10000 CATGM #${tokenId}`,
    //         description: "After the token generation event, you can exchange this NFT Voucher for $CATGM tokens.",
    //         image: `https://nft.catgoldminer.ai/catgm-voucher-item.png`,
    //         attributes: [{ value: "10000" }]
    //     }
    // }
}
