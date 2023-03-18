import React, { useState, useEffect, useContext } from 'react';
import { ethers, utils } from "ethers";
import DropDownChain from './components/dropdown/DropdownChain';
import ConnectWallet from './components/connectWallet/ConnectWallet';
import DropdownFunctionElement from './components/dropdown/DropdownFunctionElement';
import WalletContext from './context/WalletContext';
import EachFunctionElement from './components/eachFunctionElement/EachFunctionElement';
import { checkAddressIndexIsValid } from './utils/argumentHandle/checkAddressIndexIsValid';
import { checkUintIndexIsValid } from './utils/argumentHandle/checkUintIndexIsValid';
import { sortArgumentsInput } from './utils/argumentHandle/sortArgumentsInput';




const App = () => {
    const [address, setAddress] = useState('');
    const [contractElement, setContractElement] = useState([]);
    const [arrayArgument, setArrayArgument] = useState({});
    const [showDataFunction, setShowDataFunction] = useState('');
    const [eachFunction, setEachFunction] = useState('');
    const [inputByMsg, setInputByMsg] = useState('');
    const [chainId, setChainId] = useState('');



    const { 
        provider, 
        signer, 
        connectChainId, 
    } = useContext(WalletContext);
    


    const dropdownChainIdChangeHandler = (e) => {
        setChainId(e.target.value);
    }


    const dropdownFnChangeHandler = (e) => {
        setArrayArgument([]);
        setShowDataFunction('');
        setEachFunction(e.target.value)
    }



    /**
     * dropdown tag for show each function when select it 
    */
    const filterFunction = contractElement.filter((data) => {return data.function === eachFunction});
    const functionNames = contractElement.map((data) => data.function)
    

    /**
     * 
     * @param {*} event - get address of contract 
     */
    const addressChangeHandler = (event) => {
        setAddress(event.target.value);
    };


    /**
     * 
     * @param {*} event - submit the contract address 
     * @returns - contract json from abi of contract address
     */
    const onSubmitAddress = async (event) => {
        event.preventDefault();

        if (!chainId) return setShowDataFunction('Please selected chain');
        if (+chainId !== +connectChainId) return setShowDataFunction('Please select chainId same of you network')
        if (address && utils.isAddress(address)) {
            try {
                let data = {
                    address: address,
                    chainId: +chainId
                }
                console.log(data);

                //network test http://172.20.10.3:8080/
                // http://localhost:8080
                // https://goerli-api.jfkongphop.repl.co
                const response = await fetch('https://goerli-api.jfkongphop.repl.co', {
                    method : "POST", 
                    body : JSON.stringify(data),
                    headers : {
                    'Content-Type' : 'application/json'
                    }
                });

                const ct = await response.json();
                console.log(ct);
                if (ct.error === 'error') return setShowDataFunction(ct.error);
                setContractElement(ct);

                return
            }

            catch (err) {
                console.log(err);
            }
        }

        else return setShowDataFunction('Address is invalid');

        return;
    };



    /**
     * 
     * @param {*} event - get the inputs from different of function abi
     */
    const parameterHandleChange = (event) => {
        setArrayArgument({
            ...arrayArgument,
            [event.target.name]: event.target.value
        });
    }


    const onChangeEtherInput = (e) => {
        console.log(e.target.value);
        setInputByMsg(e.target.value);
    }
 


    /**
     * 
     * @param {*} event - event to submit
     * @param {*} method - name of function in abi
     * @param {*} param - array of parameter in abi
     * @param {*} arrayArgument - array of argument from inputs
     * @param {*} type - type of function in abi
     * @param {*} outputs - type of outputs afer execute
     * @returns - data from read function or address of transaction execution
     */
    const submitTransaction = async (
        event, 
        method, 
        param, 
        arrayArgument, 
        type, 
        outputs
    ) => {
        event.preventDefault();
        setShowDataFunction('');

        
        // check we connect the rpc
        if (!provider) return setShowDataFunction('Please connect wallet');

        // sort argument input
        const onlyValueInputs = Object.values(sortArgumentsInput(param, arrayArgument));
        const checkInputsUndefined = onlyValueInputs.filter((data) => data !== undefined);
        const onlyParamType = param.map((data) => data.type) || []; 

        // check all of the input is valid
        if (param.length !== checkInputsUndefined.length) {
            return setShowDataFunction('Please fill complete of inputs');
        }

        // check the input address is valid
        if (checkAddressIndexIsValid(param, onlyValueInputs)) {
            return setShowDataFunction('Address is invalid');
        }

        // check the input uint is valid
        if (checkUintIndexIsValid(onlyParamType, onlyValueInputs)) {
            console.log('Integer is invalid');
            return setShowDataFunction('Integer is invalid');
        }

        // set argument for function in abi
        const paramsInFunctions = param.map((data) => data.type + ' ' + data.name) || [];  
        if (paramsInFunctions.length > 1) paramsInFunctions.join(', ');


        // check readable function in abi
        if (type === 'view' || type === 'pure') {
            const ABI = [`function ${method}(${paramsInFunctions})`];
            const iface = new utils.Interface(ABI);
            const encodeData = iface.encodeFunctionData(`${method}`, onlyValueInputs);
    
            const response = await provider.call({
                to: address,
                data: encodeData
            });

            if (outputs === 'string') {
                console.log(response);
                console.log(utils.toUtf8String(response));
                setShowDataFunction(utils.toUtf8String(response));
            }

            else if (outputs === 'address') {
                setShowDataFunction(response)
            }

            else {
                try {
                    console.log(response);
                    const bigNumber = ethers.BigNumber.from(response);
                    const decimalNumber = bigNumber.toString();

                    console.log(decimalNumber);
                    setShowDataFunction(decimalNumber);
                }

                catch (err) {
                    console.log(err);
                }
            }
            
            setArrayArgument([]);
            return;
        }


        else if (param.length === 0 && type === 'payable' /*|| type === 'nonpayable'*/) {
            if (isNaN(inputByMsg) || inputByMsg < 0 || !inputByMsg) return setShowDataFunction('Invalid input')
            const ABI = [`function ${method}()`];
            const iface = new utils.Interface(ABI);
            const encodeData = iface.encodeFunctionData(`${method}`);

            const tx = await signer.sendTransaction({
                to: address,
                data: encodeData,
                value: utils.parseEther(inputByMsg)
            })

            await tx.wait();
            console.log('done');
            setShowDataFunction(`done ${tx.hash}`)
            setInputByMsg(0);
            return;
        }


        else {
            // console.log(paramsInFunctions);
            const ABI = [`function ${method}(${paramsInFunctions})`];
            const iface = new utils.Interface(ABI);
            const encodeData = iface.encodeFunctionData(`${method}`, onlyValueInputs);

            const tx = await signer.sendTransaction({
                to: address,
                data: encodeData,
                gasLimit: 50000
            });

            await tx.wait();
            console.log('done');
            setShowDataFunction(`done ${tx.hash}`)
            setArrayArgument([]);
            return;
        }
    };


    return (
        <div>
            <ConnectWallet/>
            <div>
                <DropDownChain 
                    onChangeDropdown={dropdownChainIdChangeHandler}
                    chainId={chainId}
                />
            </div>
            <form onSubmit={onSubmitAddress}>
                <label htmlFor="address">Address</label>
                <input 
                    type="text" 
                    value={address}
                    onChange={addressChangeHandler}
                    placeholder={showDataFunction}
                    style={{width: '400px'}}
                />
                {/* <div>increment : 0xFebd4eDc1d914669A40BE5221852feCdBD066DF5</div>
                <div>greeting : 0x235BE3396C94942Dccd7788C32E65f23154A8ED6</div> */}
                 <div>erc20Test : 0x7c87561b129f46998fc9Afb53F98b7fdaB68696f</div>
                {/*<div>smartFunding : 0x980306e668Fa1E4246e2AC86e06e12B67A5fD087</div> */}
                <button type='submit'>submit</button>
            </form>
            {
                functionNames.length > 0 
                && 
                <DropdownFunctionElement
                    functionNames={functionNames}
                    eachFunction={eachFunction}
                    onChangeFn={dropdownFnChangeHandler}
                />
            }
            {showDataFunction === 'error' && <div>Contract address is not found in this chain</div>}
            <EachFunctionElement 
                filterFunction={filterFunction}
                arrayArgument={arrayArgument} 
                showDataFunction={showDataFunction} 
                contractElement={contractElement}
                onChangeEtherInput={onChangeEtherInput} 
                parameterHandleChange={parameterHandleChange}
                submitTransaction={submitTransaction}
            />
        </div>
    )
}

export default App;