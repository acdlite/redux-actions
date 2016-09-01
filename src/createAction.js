import identity from 'lodash/identity';
import isUndefined from 'lodash/isUndefined';

export default function createAction(type, payloadCreator, metaCreator) {
  const finalPayloadCreator = typeof payloadCreator === 'function'
    ? payloadCreator
    : identity;

  const actionHandler = (...args) => {
    const hasError = args[0] instanceof Error;

    const action = {
      type
    };

    const payload = hasError ? args[0] : finalPayloadCreator(...args);
    if (!isUndefined(payload)) {
      action.payload = payload;
    }

    if (hasError) {
      // Handle FSA errors where the payload is an Error object. Set error.
      action.error = true;
    }

    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(...args);
    }

    return action;
  };

  actionHandler.toString = () => type.toString();

  return actionHandler;
}
