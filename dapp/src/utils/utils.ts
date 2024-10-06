import Web3 from 'web3';



const web3 = new Web3();

export function convertBigIntJsonToString(json: any) {
    const convertValue = (value: any): any => {
        if (typeof value === 'bigint') {
            return Number(value); // Convert BigInt to a number (if within safe range)
        } else if (typeof value === 'object' && value.constructor.name === 'BigNumber') {
            return Number(value.toString()); // Convert BigNumber to string, then to a number
        } else if (Array.isArray(value)) {
            return value.map(convertValue);
        } else if (typeof value === 'object' && value !== null) {
            return convertBigIntJsonToString(value);
        }
        return value;
    };

    const result: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(json)) {
        result[key] = convertValue(value);
    }
    return result;
}

interface CatObject {
    catType: number;
    level: number;
    attack: number;
    armor: number;
    attackSpeed: number;
    magic: number;
    manaPoint: number;
    healthPoint: number;
    criticalDamage: number;
    equippedItems: any[];
    lastClaimTime: number;
    liveTime: number;
    catId: number;
}

export interface CatData {
    data: CatObject[];
}

export const convertToArray = (data: any): CatData => {
    const formattedData: CatData = {
        data: Object.keys(data).map((key) => data[key])
    };
    return formattedData;
};
