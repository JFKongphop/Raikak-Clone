import Button from "../UI/button/Button";
import Input from "../UI/input/Input";


const EachFunctionElement = (props) => {
        // if want to show of all function use contractElement instead filterFunction
        // will useMemo to control when some stage is not change
        let eachFunctionElement;
        try {
            eachFunctionElement = props.filterFunction.map((method, index) => (
                <div key={index}>  
                    <div>
                        <h3>{method.function}</h3>
                            <form>
                                {
                                    method.parameter.length === 0 
                                    &&
                                    (
                                        method.stateMutability === 'payable'
                                        /*|| method.stateMutability === 'nonpayable'*/
                                    )
                                    ?
                                    <div>
                                        <label >Ether</label>
                                        <input 
                                            type='number'
                                            step='0.1'
                                            placeholder='ether'
                                            onChange={props.onChangeEtherInput}
                                        />
                                    </div>
                                    :
                                    method.parameter.map((param, index) => (
                                        <div key={index}>
                                            <label>{param.name}</label>
                                            <input 
                                                type={param.type.includes('uint') ? 'number' : 'text'}
                                                name={`${param.name}`}
                                                placeholder={`${param.type}`}
                                                onChange={props.parameterHandleChange}
                                                style={{width: param.type === 'address'  ? '350px' : ''}}
                                            />
                                        </div>
                                    ))
                                }
                                <Button
                                    onClick={
                                        (e) => props.submitTransaction(
                                            e, 
                                            method.function, 
                                            method.parameter, 
                                            props.arrayArgument,
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
                                </Button>
                            </form>
                        <div>{props.showDataFunction}</div>
                    </div>
                </div>
            ));
        }
        catch {
            eachFunctionElement = props.contractElement;
        }


        return (
            <div>{eachFunctionElement}</div>
        )
}

export default EachFunctionElement;