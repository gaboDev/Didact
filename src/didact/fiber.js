import Didact from './index';
import {EffectTags, isFunctionComponent} from "./utils";
import {updateFunctionComponent} from "./functionComponent";
import {updateDOM, updateHostComponent} from "./didact";

export const reconcileChildren = (wipFiber, children) => {
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
            Didact.configs.deletions.push(oldFiber);
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

const performUnitOfWork = (fiber) => {
    const children = isFunctionComponent(fiber)
                     ? updateFunctionComponent(fiber)
                     : updateHostComponent(fiber)
    reconcileChildren(fiber, children);
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
    Didact.configs.deletions.forEach(commitWork);
    commitWork(Didact.configs.wipRoot.child);
    Didact.configs.currentRoot = Didact.configs.wipRoot;
    Didact.configs.wipRoot = null;
}

export const workLoop = (deadLine) => {

    let shouldYield = false;
    while (Didact.configs.nextUnitOfWork && !shouldYield){
        Didact.configs.nextUnitOfWork = performUnitOfWork(Didact.configs.nextUnitOfWork);
        shouldYield = deadLine.timeRemaining() > 1;
    }
    if (!Didact.configs.nextUnitOfWork && Didact.configs.wipRoot){
        commitRoot();
    }

    window.requestIdleCallback(workLoop);
}

