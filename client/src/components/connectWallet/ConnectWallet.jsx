import { useState, useContext } from "react";
import WalletContext from "../../context/WalletContext"

const ConnectWallet = () => {
    const { shortAccount, errorMessage, currentNetwork, onConnectWallet } = useContext(WalletContext);

    return (
        <div className='connectBtn'>
            <button 
                className="connectMeta" 
                onClick={onConnectWallet}
            >
                {shortAccount ?  shortAccount : "connect" || errorMessage}
            </button>
            <div>{currentNetwork}</div>
        </div>
    )
}

export default ConnectWallet;