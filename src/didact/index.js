import {ElementTypes, isProp} from './resources';
import {render, updateDOM} from "./fiber";

const createTextElement = (textElement) => {
    return {
        type: ElementTypes.text,
        props: {
            nodeValue: textElement,
            children: []
        }
    }
}

const mapChildren = (children) => {
    return children.map((currentChild) => {
        return typeof currentChild === "object"
            ? currentChild
            : createTextElement(currentChild)
    });
}

const buildDOMNode = (elementType) => {
    return elementType === ElementTypes.text
        ? document.createTextNode('')
        : document.createElement(elementType);
}

const setNodeProps = (element, domNode) => {
    const {props} = element;
    const elementPropKeys = Object.keys(props);
    
    const filteredElementPropsKeys = elementPropKeys.filter(isProp);
    
    filteredElementPropsKeys.forEach((propKey) => {
        domNode[propKey] = props[propKey];
    })
}

const createDOMNode = (element) => {
    const {type} = element;
    const domNode = buildDOMNode(type);
    updateDOM(domNode, {}, element.props);
    return domNode;
}

const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: mapChildren(children)
        }
    }
}


const Didact = {
    createElement,
    createDOMNode,
    render
};
export default Didact;