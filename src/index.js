/** @jsxRuntime classic */
import Didact from "./didact";
import {useState} from "./didact/fiber";

/** @jsx Didact.createElement */
function FunctionComponent(props){
    const {title} = props;
    return (
        <p>Functional component: {title}</p>
    )
}

function ComponenWithHook(props) {
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
    /** @jsx Didact.createElement */
    Didact.render(element, container)
}

rerender("Hello world");