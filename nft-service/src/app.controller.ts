import { Controller, Get, Param, Query } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

@Controller("")
export class AppController {
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
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }
        },
        17: {
            name: "Shield", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }
        },
        18: {name: "Armor",
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }
        },
        19: {name: "Bow", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }
        },
        20: {name: "Arrow", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }
        },
        21: {name: "Glove",
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        22: {name: "Scepter", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        23: {name: "Book", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        24: {name: "Witch's Hat",
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        25: {name: "Orb", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        26: { name:"Potion", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        27: {name: "Circlet",
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        28: {name: "Dagger", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        29: {name: "Cloak", 
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }},
        30: {name: "Boots",
            attributes: {
                attack: 10,
                armor: 10,
                attackSpeed: 10,
                magic: 10,
                manaPoint: 10,
                healthPoint: 10,
                criticalDamage: 10
            }}
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
            image: `https://nft.tonhellowrold.xyz/cat-${query.type}.avif`,
            attributes: [{ 
                type: query.type,
                level: query.level,
                attack: query.attack,
                armor: query.armor,
                attackSpeed: query.attackSpeed,
                magic: query.magic,
                manaPoint: query.manaPoint,
                healthPoint: query.healthPoint,
                criticalDamage: query.criticalDamage,
                equippedItems: query.equippedItems,
                liveTime: query.liveTime,
                dob: query.dob
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
