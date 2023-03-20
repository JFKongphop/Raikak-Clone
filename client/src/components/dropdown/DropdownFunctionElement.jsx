const DropdownFunctionElement = (props) => {
    return (
        <select value={props.eachFunction || 'None'} onChange={props.onChangeFn}>
            <option>Select function</option>
            {props.functionNames.map((name) => (
                <option key={name} value={name} >{name}</option>
            ))}
        </select>
    )
}

export default DropdownFunctionElement;