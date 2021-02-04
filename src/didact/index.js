import {workLoop} from "./fiber";
import {createDOMNode, createElement, render} from "./didact";

const buildDidactInstance = () => {
    const configs = {
        nextUnitOfWork: null,
        wipRoot: null,
        currentRoot: null,
        deletions: [],
        wipFiber: null,
        hookIndex: null
    }
    return {
        createElement,
        render,
        createDOMNode,
        configs
    }
}

window.requestIdleCallback(workLoop);
const Didact = buildDidactInstance();
export default Didact;