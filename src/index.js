/** @jsxRuntime classic */
/** @jsx Didact.createElement */

import Didact from "./didact";
import {useState} from "./didact/hooks";

function FunctionComponent(props){
    const {title} = props;
    return (
        <p>Functional component: {title}</p>
    )
}

const ComponenWithHook = (props) => {
    const {initialValue} = props;
    const [value, setValue] = useState(initialValue);
    const handleClick = () => {
        setValue(c => Math.random());
    }
    return (
        <button onClick={handleClick}>
            {value}
        </button>
    )
}

const updateValue = e => {
    rerender(e.target.value)
}

const rerender = value => {
    const container = document.getElementById("root");
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <FunctionComponent title={value}/>
            <ComponenWithHook initialValue='Go'/>
        </div>
    );
    Didact.render(element, container)
}

rerender("Hello world");