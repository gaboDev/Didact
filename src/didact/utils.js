export const ElementTypes = {
    text: 'TEXT_ELEMENT'
}
export const EffectTags = {
  update: 'UPDATE',
  placement: 'PLACEMENT',
  deletion: 'DELETION'
};
export const isEvent = (key) => {
    return key.startsWith('on');
};
export const isProp = (key) => {
    return key !== 'children' && !isEvent(key);
};
export const isNew = (prev, next) => key => prev[key] !== next[key];
export const isGone = (prev, next) => key => !(key in next);
export const getEventType = (key) => key.toLowerCase().substring(2);
export const isFunctionComponent = (fiber) => fiber.type instanceof Function;
