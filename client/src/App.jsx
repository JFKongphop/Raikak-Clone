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
    const [arrayParameter, setArrayParameter] = useState({});
    const [showDataFunction, setShowDataFunction] = useState('');
    const [testGreet, setTestGreet] = useState('');

    
    const greetChangeHandler = (e) => {
        setTestGreet(e.target.value);
    }
    

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


    const addressChangeGHandler = (event) => {
        setAddress(event.target.value);
    };


    const onSubmitAddress = async (event) => {
        event.preventDefault();

        if (address) {
            try {
                let data = {
                    address: address
                }
                console.log(data);

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



    const parameterHandleChange = (event) => {
        setArrayParameter({
            ...arrayParameter,
            [event.target.name]: event.target.value
        });
    }


    const submitTransaction = async (
        event, 
        method, 
        param, 
        arrayParameter, 
        type, 
        outputs
    ) => {
        event.preventDefault();
        setShowDataFunction('');

        const onlyValueInputs = Object.values(arrayParameter);
        const params = param.map((data) => data.type + ' ' + data.name) || [];           
        let paramsInFunctions = params;
        console.log(arrayParameter);

        // will fix if it input of not address
        if (param.length !== onlyValueInputs.length) return;

        if (params.lenght > 1) paramsInFunctions.join(', ');

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
            
            setArrayParameter([]);
            return;
        }

        else {
            console.log(paramsInFunctions);
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
            setArrayParameter([]);
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
                                    arrayParameter || [],
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
                    onChange={addressChangeGHandler}
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