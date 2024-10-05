import { OpenedContract, TonClient, WalletContractV4 } from "ton"
import { KeyPair, mnemonicToPrivateKey } from "ton-crypto"

export type OpenedWallet = {
    contract: OpenedContract<WalletContractV4>
    keyPair: KeyPair
}

export async function openWallet(mnemonic: string[], testnet: boolean) {
    const keyPair = await mnemonicToPrivateKey(mnemonic)

    const toncenterBaseEndpoint: string = testnet ? "https://testnet.toncenter.com" : "https://toncenter.com"

    const client = new TonClient({
        endpoint: `${toncenterBaseEndpoint}/api/v2/jsonRPC`,
        apiKey: process.env.TONCENTER_API_KEY
    })

    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey
    })

    let contract = client.open(wallet)
    return { contract, keyPair }
}

export async function waitSeqno(seqno: number, wallet: OpenedWallet) {
    for (let attempt = 0; attempt < 10; attempt++) {
        await sleep(2000)
        const seqnoAfter = await wallet.contract.getSeqno()
        if (seqnoAfter == seqno + 1) break
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
