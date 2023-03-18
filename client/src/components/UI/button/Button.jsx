const Button = (props) => {
    return (
        <button 
            type={props.type || null}
            onClick={props.onClick || null}
        >{props.children}</button>
    )
}

export default Button;