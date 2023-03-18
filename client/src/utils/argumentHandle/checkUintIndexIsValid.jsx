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
 * @param {*} onlyParamType type of each parameter
 * @param {*} onlyValueInputs value of the input to use in argumemt
 * @returns true or false 
 */
export const checkUintIndexIsValid = (onlyParamType, onlyValueInputs) => {
    const indexUint = findIndexUint(onlyParamType);
    const lengthOfIndexUint = indexUint.length;
    const statusIsUint = [];
    for (let index = 0; index < lengthOfIndexUint; index++) {
        statusIsUint.push(
            !isNaN(onlyValueInputs[indexUint[index]])
        );
    }
    const filterStatusUint = statusIsUint.filter((data) => data === true);
    const validUintIndex = statusIsUint.length !== filterStatusUint.length

    return validUintIndex;
}