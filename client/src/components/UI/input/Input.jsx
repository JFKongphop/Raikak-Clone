import React from 'react'

const Input = (props) => {
    console.log(props.type, props.placeholder );
    return (
        <div>
            <label>{props.title}</label>
            <input
                type={props.type || null}
                placeholder={props.placeholder || null}
                name={props.name || null}
                value={props.value| null}
                onChange={props.onChange || null}
                style={props.style || null}
                step={props.step || null}
            />
        </div>
    )
}

export default Input;