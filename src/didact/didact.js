import {ElementTypes, getEventType, isEvent, isGone, isNew, isProp} from './utils';
import Didact from "./index";

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

export const createDOMNode = (element) => {
    const {type} = element;
    const domNode = buildDOMNode(type);
    updateDOM(domNode, {}, element.props);
    return domNode;
}

export const updateHostComponent = (fiber) => {
    if (!fiber.dom){
        fiber.dom = createDOMNode(fiber);
    }
    const {children} = fiber.props;
    return children;
}

const filterProps = (props, ...filters) => {
    const propKeys = Object.keys(props);
    const [firstFilter, secondFilter] = filters;
    return propKeys.filter(firstFilter)
        .filter(secondFilter);
}

const updateEventListeners = (filteredPropKeys, props, dom, removeEventListeners = false) => {
    filteredPropKeys.forEach((currentPropKey) => {
        const eventType = getEventType(currentPropKey);
        const eventListener = props[currentPropKey];
        removeEventListeners
            ? dom.removeEventListener(eventType, eventListener)
            : dom.addEventListener(eventType, eventListener);
    });
}


export const updateDOM = (dom, prevProps, nextProps) => {
    const oldPropKeys = filterProps(prevProps, isProp, isGone(prevProps, nextProps));
    oldPropKeys.forEach(key => dom[key] = '');

    const existOrIsNew = key => !(key in nextProps) || isNew(prevProps, nextProps)(key);
    const oldPropEventKeys = filterProps(prevProps, isEvent, existOrIsNew)
    updateEventListeners(oldPropEventKeys, prevProps, dom, true);

    const filteredNewPropKeys = filterProps(nextProps, isProp, isNew(prevProps, nextProps));
    filteredNewPropKeys.forEach(key => dom[key] = nextProps[key]);

    const nextPropEventKeys = filterProps(nextProps, isEvent, isNew(prevProps, nextProps));
    updateEventListeners(nextPropEventKeys, nextProps, dom);
}

export const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: mapChildren(children)
        }
    }
}

export const render = (element, container) => {
    Didact.configs.wipRoot = {
        dom: container,
        props:{
            children: [element]
        },
        alternate: Didact.configs.currentRoot
    }
    Didact.configs.deletions = [];
    Didact.configs.nextUnitOfWork = Didact.configs.wipRoot;
}

