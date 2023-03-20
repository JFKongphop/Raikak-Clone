import chainIdLists from "../../utils/provideData/chainLists";

const DropDownChain = (props) => {
    return (
        <select value={props.chainId} onChange={props.onChangeDropdown}>
            <option>Please select chain</option>
            {chainIdLists.map((data) => (
                <option key={data.id} value={data.id} >{data.name}</option>
            ))}
        </select>
    )
}
export default DropDownChain;