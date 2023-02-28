const cheerio = require('cheerio');
const axios = require('axios'); 
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());
//0x7c87561b129f46998fc9Afb53F98b7fdaB68696f

const scrapeContract = async (address) =>{
    const etherContractUrl = `https://goerli.etherscan.io/address/${address}#code`
    
    const contractElement = {
        bytecode: '',
        abi: ''
    };

    try{
        const { data } = await axios.get(etherContractUrl);
        const $ = cheerio.load(data);
        const item = $('main#content');

        contractElement.bytecode = $(item).find('div div#verifiedbytecode2').text();
        contractElement.abi = JSON.parse($(item).find('div#dividcode div pre#js-copytextarea2').text());

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
        
        const allElement = {
            functionElement,
            abi: contractElement.abi
        }

        return allElement;
    }
    
    catch (err){
        return err;
    }
}



app.get('/', (req, res) => {
    res.status(200).send('hello')
})

app.post('/', async (req, res) => {
    const address = req.body.address;
    console.log(address);
    
    const data = await scrapeContract(address);
    console.log(data);
    return res.status(200).json(data);
})


app.listen(8080, () => {
    console.log('server is running at http://localhost:8080');
}) 