import Didact from './index';
import {EffectTags, getEventType, isEvent, isFunctionComponent} from "./resources";
import {isProp, isNew, isGone} from "./resources";


let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = [];

const reconcileChildren = (wipFiber, children) => {
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;
    for (let index = 0; index < children.length || oldFiber; index++) {
        const child = children[index];
        let newFiber = null;

        const areSameType =
            oldFiber &&
            child &&
            child.type === oldFiber.type;

        if (areSameType) {
            newFiber = {
                type: oldFiber.type,
                props: child.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: EffectTags.update
            };
        }
        if (child && !areSameType) {
            newFiber = {
                type: child.type,
                props: child.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: EffectTags.placement
            };
        }
        if (oldFiber && !areSameType) {
            oldFiber.effectTag = EffectTags.deletion;
            deletions.push(oldFiber);
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0){
            wipFiber.child = newFiber;
        }else if (child){
                prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
    }
}

let wipFiber = null
let hookIndex = null

const updateFunctionComponent = (fiber) => {
    wipFiber = fiber
    hookIndex = 0
    wipFiber.hooks = []
    const children = fiber.type(fiber.props);
    reconcileChildren(fiber, [children])
}

const updateHostComponent = (fiber) => {
    if (!fiber.dom){
        fiber.dom = Didact.createDOMNode(fiber);
    }
    const {children} = fiber.props;
    reconcileChildren(fiber, children);
}

const performUnitOfWork = (fiber) => {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent){
        updateFunctionComponent(fiber);
    }else{
        updateHostComponent(fiber);
    }
    if (fiber.child){
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber){
        if (nextFiber.sibling){
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

export const useState = (initial) => {
    const oldHook =
        wipFiber.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    }

    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
        hook.state = action(hook.state);
    })

    const setState = action => {
        hook.queue.push(action)
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        }
        nextUnitOfWork = wipRoot;
        deletions = []
    }

    wipFiber.hooks.push(hook)
    hookIndex++
    return [hook.state, setState]
}

export const updateDOM = (dom, prevProps, nextProps) => {
    
    const oldPropKeys = Object.keys(prevProps);
    const filteredOldPropKeys = oldPropKeys.filter(isProp)
                                           .filter(isGone(prevProps, nextProps));
    filteredOldPropKeys.forEach(key => dom[key] = '');

    const eventOldPropKeys = oldPropKeys.filter(isEvent)
                                     .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key));
    eventOldPropKeys.forEach(key => {
        const eventType = getEventType(key);
        dom.removeEventListener(
            eventType,
            prevProps[key]
        );
    });

    const newPropKeys = Object.keys(nextProps);
    const filteredNewPropKeys = newPropKeys.filter(isProp)
                                           .filter(isNew(prevProps, nextProps));
    filteredNewPropKeys.forEach(key => dom[key] = nextProps[key]);

    const eventNextPropKeys = newPropKeys.filter(isEvent)
                                         .filter(isNew(prevProps, nextProps));
    eventNextPropKeys.forEach(name => {
            const eventType = getEventType(name);
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })

}

const commitDeletion = (fiber, domParent) => {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

const commitWork = (fiber) => {
    if (!fiber) return;

    let domParentFiber = fiber.parent
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }
    const domParent = domParentFiber.dom

    if (fiber.effectTag === EffectTags.placement && fiber.dom !== null){
        domParent.appendChild(fiber.dom);
    }else if (fiber.effectTag === EffectTags.update && fiber.dom !== null){
        updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
    }else if (fiber.effectTag === EffectTags.deletion){
        domParent.removeChild(fiber.dom);
        commitDeletion(fiber,domParent);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

const commitRoot = () => {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

export const workLoop = (deadLine) => {

    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadLine.timeRemaining() > 1;
    }
    if (!nextUnitOfWork && wipRoot){
        commitRoot();
    }

    window.requestIdleCallback(workLoop);
}

window.requestIdleCallback(workLoop);

export const render = (element, container) => {
    wipRoot = {
        dom: container,
        props:{
            children: [element]
        },
        alternate: currentRoot
    }
    deletions = [];
    nextUnitOfWork = wipRoot;
    
}

