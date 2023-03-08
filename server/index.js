const cheerio = require('cheerio');
const axios = require('axios'); 
const express = require('express');
const cors = require('cors');
const { utils } = require('ethers');
const app = express();
app.use(express.json());
app.use(cors());
// 0x7c87561b129f46998fc9Afb53F98b7fdaB68696f test


/*
    not verify that not have abi and bytecode
    0x7Ef17Da8398C57724b866a75d4c3D02425037d37
*/

const selectedChainId = (address, chainId) => {
    const ethGoerli = `https://goerli.etherscan.io/address/${address}#code`;
    const ethMainnet = `https://etherscan.io/address/${address}#code`
    const opGoerli = `https://goerli-optimism.etherscan.io/address/${address}#code`;
    const opMainnet = `https://optimistic.etherscan.io/address/${address}#code`;
    const bscMainnet = `https://bscscan.com/token/${address}#code`;
    const bscTestnet = `https://testnet.bscscan.com/address/${address}#code`;
    const polygon = `https://polygonscan.com/address/${address}#code`;
    const polygonMumbai = `https://mumbai.polygonscan.com/address/${address}#code`;
    const arbiMainnet = `https://arbiscan.io/address/${address}#code`;
    let urlContract;
    if (chainId === 5) urlContract = ethGoerli;
    else if (chainId === 0) urlContract = ethMainnet;
    else if (chainId === 420) urlContract = opGoerli;
    else if (chainId === 10) urlContract = opMainnet;
    else if (chainId === 56) urlContract = bscMainnet;
    else if (chainId === 87) urlContract = bscTestnet;
    else if (chainId === 137) urlContract = polygon;
    else if (chainId === 80001) urlContract = polygonMumbai;
    else if (chainId === 42161) urlContract = arbiMainnet;

    return urlContract;
}

const scrapeContract = async (address, chainId) =>{

    const urlContract = selectedChainId(address, chainId);

    const mainTage = 'main#content';
    const bytecodeTage = 'div div#verifiedbytecode2';
    const abiTage = 'div#dividcode div pre#js-copytextarea2';
    const contractElement = {
        bytecode: '',
        abi: ''
    };

    try{
        const { data } = await axios.get(urlContract);
        const $ = cheerio.load(data);
        const item = $(mainTage);

        if (
            $(item).find(bytecodeTage).length
            && $(item).find(abiTage).length
        ) {
            contractElement.bytecode = $(item).find(bytecodeTage).text();
            contractElement.abi = JSON.parse($(item).find(abiTage).text());

            let functionElement = [];
            contractElement.abi.filter((abiElement) => 
                abiElement.type === 'function')
                .map((element) => 
                    functionElement.push({
                        function: element.name,
                        parameter: element.inputs,
                        stateMutability: element.stateMutability,
                        outputs: element.outputs[0]?.type
                    }
                )
            );

            return functionElement;
        }

        else {
            return {error : 'error'};
        }
    }
    
    catch (err){
        return err;
    }
}



app.get('/', (req, res) => {
    res.status(200).send('hello')
})

app.post('/', async (req, res) => {
    const { address, chainId } = req.body;

    // check it is address of contract
    console.log(address);
    
    if (utils.isAddress(address)) {
        const data = await scrapeContract(address, chainId);
        console.log(data);
        return res.status(200).json(data);
    }

    return res.status(404).json('The address is invalid')

})


app.listen(8080, () => {
    console.log('server is running at http://localhost:8080');
}) 