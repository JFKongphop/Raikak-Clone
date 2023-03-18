import { utils } from "ethers";

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
 * @param {*} param parameter of this function on contract
 * @param {*} onlyValueInputs value of the input to use in argumemt
 * @returns true or false
 */
export const checkAddressIndexIsValid = (param, onlyValueInputs) => {
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
    const validAddressIndex = statusIsAddress.length !== filterStatusAddress.length;

    return validAddressIndex;
}