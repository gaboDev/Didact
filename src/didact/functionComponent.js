import Didact from "./index";

export const updateFunctionComponent = (fiber) => {
    Didact.configs.wipFiber = fiber
    Didact.configs.hookIndex = 0
    Didact.configs.wipFiber.hooks = [];
    const children = fiber.type(fiber.props);
    return [children];
}