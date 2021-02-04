import Didact from "./index";

export const useState = (initial) => {
    const oldHook =
        Didact.configs.wipFiber.alternate &&
        Didact.configs.wipFiber.alternate.hooks &&
        Didact.configs.wipFiber.alternate.hooks[Didact.configs.hookIndex];
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
        Didact.configs.wipRoot = {
            dom: Didact.configs.currentRoot.dom,
            props: Didact.configs.currentRoot.props,
            alternate: Didact.configs.currentRoot,
        }
        Didact.configs.nextUnitOfWork = Didact.configs.wipRoot;
        Didact.configs.deletions = []
    }

    Didact.configs.wipFiber.hooks.push(hook)
    Didact.configs.hookIndex++
    return [hook.state, setState]
}