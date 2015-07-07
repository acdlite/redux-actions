redux-actions
=============

[![build status](https://img.shields.io/travis/acdlite/redux-actions/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-actions)
[![npm version](https://img.shields.io/npm/v/redux-actions.svg?style=flat-square)](https://www.npmjs.com/package/redux-actions)

[Flux Standard Action](https://github.com/acdlite/flux-standard-action) utilities for Redux.

```js
npm install --save redux-actions
```

### `createAction(type, actionCreator = Identity)`

Wraps an action creator so that its return value is the payload of a Flux Standard Action. If no action creator is passed, or if the action creator is not a function, the identity function is used.

Example:

```js
let increment = createAction('INCREMENT', amount => amount);
// same as
increment = createAction('INCREMENT');

expect(increment(42)).to.deep.equal({
  type: 'INCREMENT',
  payload: 42
});
```

**NOTE:** The more correct name for this function is probably `createActionCreator()`, but that seems a bit redundant.

Use the identity form to create one-off actions:

```js
createAction('ADD_TODO')('Use Redux');
```

### `handleAction(type, reducer | reducerMap)`

Wraps a reducer so that only handles Flux Standard Actions of a certain type.

If a single reducer is passed, it is used to handle normal actions. (A normal action is analogous to a resolved promise.) For failed actions(A failed action is analogous to a rejected promise.), it will set a default `throw` function. (do nothing but return state.)

Otherwise, you can specify separate reducers for `next()` and `throw()`. This API is inspired by the ES6 generator interface. (ps. if you do not set `throw` property, it also use the default `throw` function.)

```js
handleAction('FETCH_DATA', {
  next(state, action) {...}
  throw(state, action) {...}
});
```

### `handleActions(reducerMap, ?defaultState)`

Creates multiple reducers using `handleAction()` and combines them into a single reducer that handles multiple actions. Accepts a map where the keys are the passed as the first parameter to `handleAction()` (the action type), and the values are passed as the second parameter (either a reducer or reducer map).

The optional second parameter specifies a default or initial state, which is used when `undefined` is passed to the reducer.

(Internally, `handleActions()` works by applying multiple reducers in sequence using [reduce-reducers](https://github.com/acdlite/reduce-reducers).)

Example:

```js
const reducer = handleActions({
  INCREMENT: (state, action) => ({
    counter: state.counter + action.payload
  }),

  DECREMENT: (state, action) => ({
    counter: state.counter - action.payload
  })
}, { counter: 0 });
```

## Usage with middleware

redux-actions is handy all by itself, however, it's real power comes when you combine it with middleware.

The identity form of `createAction` is a great way to create a single action creator that handles multiple payload types. For example, using [redux-promise](https://github.com/acdlite/redux-promise) and [redux-rx](https://github.com/acdlite/redux-rx):

```js
let addTodo = createAction('ADD_TODO');

// A single reducer...
handleAction('ADD_TODO', (state = { todos: [] }, action) => ({
  ...state,
  todos: [...state.todos, action.payload]
}));

// ...that works with all of these forms:
// (Don't forget to use `bindActionCreators()` or equivalent.
// I've left that bit out)
addTodo('Use Redux')
addTodo(Promise.resolve('Weep with joy'));
addTodo(Observable.of(
  'Learn about middleware',
  'Learn about higher-order stores'
)).subscribe();
```

## See also

Use redux-actions in combination with FSA-compliant libraries.

- [redux-promise](https://github.com/acdlite/redux-promise) - Promise middleware
- [redux-rx](https://github.com/acdlite/redux-rx) - Includes observable middleware.
