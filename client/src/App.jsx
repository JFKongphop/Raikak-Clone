import React, { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";


const App = () => {
    const [address, setAddress] = useState('');
    const [contractElement, setContractElement] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [shortAccount, setShortAccount] = useState(null);
    const [executeDone, setExecuteDone] = useState(null);
    const [arrayArgument, setArrayArgument] = useState({});
    const [showDataFunction, setShowDataFunction] = useState('');
    const [testGreet, setTestGreet] = useState('');


    const greetChangeHandler = (e) => {
        setTestGreet(e.target.value);
    }
    


    /**
     * connect wallet on frontend
     */
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

        if (address && utils.isAddress(address)) {
            try {
                let data = {
                    address: address
                }
                console.log(data);

                //network test http://172.20.10.3:8080/
                const response = await fetch('http://localhost:8080', {
                    method : "POST", 
                    body : JSON.stringify(data),
                    headers : {
                    'Content-Type' : 'application/json'
                    }
                });

                const ct = await response.json();
                console.log(ct);
                setContractElement(ct);

                return
            }

            catch (err) {
                console.log(err);
            }
        }

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



    /**
     * 
     * @param {*} params - array of params in abi
     * @returns - array that contain the index of address param
     */
    const findIndexAddress = (params) => {
        const indexAddress = []
        params.forEach((element, index) => {
            if (element === 'address') {
                indexAddress.push(index);
            }
        });

        return indexAddress;
    }



    /**
     * 
     * @param {*} params 
     * @returns - array that contain the index of uint param
     */
    const findIndexUint = (params) => {
        const indexUint = [];
        params.forEach((element, index) => {
            if (element.includes('uint')) {
                indexUint.push(index);
            }
        });

        return indexUint;
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

        // check user fill complete of all inputs box
        // solve this input that undefined
        const nameParams = param.map((data) => data.name) || [];
        const sortParam = {};
        for (const param of nameParams) {
            sortParam[param] = arrayArgument[param]; 
        }
        const onlyValueInputs = Object.values(sortParam);
        const checkInputsUndefined = onlyValueInputs.filter((data) => data !== undefined);
        if (param.length !== checkInputsUndefined.length) {
            return setShowDataFunction('Please fill complete of inputs');
        }


        // check inputs box that fill address that is valid address
        const onlyParamType = param.map((data) => data.type) || [];  

        const indexAddress = findIndexAddress(onlyParamType);
        const lengthOfIndexAddress = indexAddress.length;
        const statusIsAddress = []
        for (let index = 0; index < lengthOfIndexAddress; index++) {
            statusIsAddress.push(
                utils.isAddress(
                    onlyValueInputs[indexAddress[index]]
                )
            );
        }
        const filterStatusAddress = statusIsAddress.filter((data) => data === true);
        if (statusIsAddress.length !== filterStatusAddress.length) {
            return setShowDataFunction('Address is invalid');
        }


        // check invalid number inputs
        const indexUint = findIndexUint(onlyParamType);
        const lengthOfIndexUint = indexUint.length;
        const statusIsUint = [];
        for (let index = 0; index < lengthOfIndexUint; index++) {
            statusIsUint.push(
                !isNaN(onlyValueInputs[indexUint[index]])
            );
        }
        const filterStatusUint = statusIsUint.filter((data) => data === true);
        if (statusIsUint.length !== filterStatusUint.length) {
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
                console.log(utils.toUtf8String(response));
                setShowDataFunction(utils.toUtf8String(response));
            }

            else {
                try {
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


    let eachFunctionElement;
    try {
        eachFunctionElement = contractElement.map((method, index) => (
            <div key={index}>  
                <div>
                    <h3>{method.function}</h3>
                    <form>
                        {
                            method.parameter.map((param, index) => (
                                <div key={index}>
                                    <label>{param.name}</label>
                                    <input 
                                        name={`${param.name}`}
                                        placeholder={`${param.type}`}
                                        onChange={parameterHandleChange}
                                    />
                                </div>
                            ))
                        }
                        <button 
                            onClick={
                                (e) => submitTransaction(
                                    e, 
                                    method.function, 
                                    method.parameter, 
                                    arrayArgument || [],
                                    method.stateMutability,
                                    method.outputs
                                )
                            }
                        >
                            {
                                method.stateMutability === 'view' 
                                || method.stateMutability === 'pure'
                                ? 'Read' : 'Write'
                            } {method.function}
                        </button>
                    </form>
                    {/* it show all of component */}
                    <div>{showDataFunction}</div>
                </div>
            </div>
        ));
    }
    catch {
        eachFunctionElement = contractElement;
    }

    
    const demoTest = async (event) => {
        event.preventDefault()
        const ABI = [`function setGreeting (string _greeting)`];
        const iface = new utils.Interface(ABI);
        const encodeData = iface.encodeFunctionData(`setGreeting`, [testGreet]);

        const tx = await signer.sendTransaction({
            to : '0x235BE3396C94942Dccd7788C32E65f23154A8ED6',
            data : encodeData,
            gasLimit: 50000
        });

        await tx.wait();
        console.log('will return totalSupply');
        setExecuteDone(tx.hash);
    }


    return (
        <div>
			<div className='connectBtn'>
                <button 
                    className="connectMeta" 
                    onClick={connectWalletHandler}
                >
                    {shortAccount ?  shortAccount : "connect"}
                </button>
			</div>
            <form onSubmit={onSubmitAddress}>
                <label htmlFor="address">Address</label>
                <input 
                    type="text" 
                    value={address}
                    onChange={addressChangeHandler}
                />
                {/* <div>increment : 0xFebd4eDc1d914669A40BE5221852feCdBD066DF5</div>
                <div>greeting : 0x235BE3396C94942Dccd7788C32E65f23154A8ED6</div> */}
                <div>erc20Test : 0x7c87561b129f46998fc9Afb53F98b7fdaB68696f</div>
                <button type='submit'>submit</button>
                <div>{executeDone}</div>
            </form>
            <form>
                <p>dummy test</p>
                <label>SET GREET</label>
                <input 
                    type='text'
                    onChange={greetChangeHandler}
                />
                <button onClick={demoTest}>setGreeet</button>
            </form>
            <div>{eachFunctionElement}</div>
        </div>
    )
}

export default App;