import { useState } from "react";
import { ethers, utils } from "ethers";
import WalletContext from "./WalletContext";

export const WalletProvider = (props) => {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState();
    const [connectChainId, setConnectChainId] = useState(0);
    const [shortAccount, setShortAccount] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [currentNetwork, setCurrentNetwork] = useState('Please connnect wallet')
    

    const connectWalletHandler = async () => {
		if (window.ethereum && defaultAccount == null) {
            try{     
                const provider = new ethers.providers.Web3Provider(window.ethereum)
                await provider.send("eth_requestAccounts", []);
                setProvider(provider);
                const signer = provider.getSigner();
                const a = await signer.getAddress();
                setSigner(signer);
                setDefaultAccount(a)
                const network = await provider.getNetwork();
                console.log(network);

                if (+network.chainId === 1) {
                    setCurrentNetwork(`ETH Mainnet | ${+network.chainId - 1}`);
                    setConnectChainId(+network.chainId - 1);
                }

                else {
                    setCurrentNetwork(`${network.name} | ${+network.chainId}`);
                    setConnectChainId(+network.chainId)
                }
                                
                setShortAccount(a.slice(0,5) + "...." + a.slice(37,42));
            }

            catch(error){
                setErrorMessage(error.message);
            }
		} 

        else if (!window.ethereum){
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	} 

    const contextValue = {
        provider: provider,
        signer: signer,
        currentNetwork: currentNetwork,
        connectChainId: connectChainId,
        shortAccount: shortAccount,
        errorMessage: errorMessage,
        onConnectWallet: connectWalletHandler
    }

    return (
        <WalletContext.Provider value={contextValue}>
            {props.children}
        </WalletContext.Provider>
    )
}