/** @jsx Didact.createElement */
/** @jsxRuntime classic */

import {useState} from "../../didact/hooks";
import Didact from '../../didact';
import './form.css';

export const Form = (props) => {
    const {initialTask} = props;
    const [task, setTask] = useState(initialTask);

    const handleInputTask = (event) => setTask( () => event.target.value);

    return (
        <div>
            <input type='text' value={task} onInput={handleInputTask}/>
            <p>Current task:
                <span>{task}</span>
            </p>
        </div>
    );
}