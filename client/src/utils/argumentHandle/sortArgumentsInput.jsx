export const sortArgumentsInput = (param, arrayArgument) => {
    const nameParams = param.map((data) => data.name) || [];
    const sortParam = {};
    for (const param of nameParams) {
        sortParam[param] = arrayArgument[param]; 
    }

    return sortParam;
}