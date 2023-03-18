import { createContext } from "react";

const WalletContext = createContext({
    provider: {},
    signer: {},
    connectChainId: '',
    shortAccount: '',
    errorMessage: '',
    onConnectWallet: () => {}
})

export default WalletContext;