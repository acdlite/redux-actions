# API Reference for handleAction(s)

- [Methods](#methods)
  - [handleAction](#handleaction)
    - [`handleAction(type, reducer, defaultState)`](#handleactiontype-reducer-defaultstate)
    - [`handleAction(type, reducerMap, defaultState)`](#handleactiontype-reducermap-defaultstate)
  - [handleActions](#handleactions)
    - [`handleActions(reducerMap, defaultState[, options])`](#handleactionsreducermap-defaultstate)

## Methods

### handleAction

```js
handleAction(type, (reducer | reducerMap = Identity), defaultState);
```

Wraps a reducer so that it only handles [Flux Standard Actions](https://github.com/redux-utilities/flux-standard-action#flux-standard-action) of a certain type.

```js
import { handleAction } from 'redux-actions';
```

#### `handleAction(type, reducer, defaultState)`{#handleactiontype-reducer-defaultstate}

If a `reducer` function is passed, it is used to handle both normal actions and failed actions. (A failed action is analogous to a rejected promise.) You can use this form if you know a certain type of action will never fail, like the increment example above.

If the reducer argument (`reducer`) is `undefined`, then the identity function is used.

The third parameter `defaultState` is required, and is used when `undefined` is passed to the reducer.

###### EXAMPLE

```js
handleAction(
  'APP/COUNTER/INCREMENT',
  (state, action) => ({
    counter: state.counter + action.payload.amount
  }),
  defaultState
);
```

#### `handleAction(type, reducerMap, defaultState)`{#handleactiontype-reducermap-defaultstate}

Otherwise, you can specify separate reducers for `next()` and `throw()` using the `reducerMap` form. This API is inspired by the ES6 generator interface.

If the reducer argument (`reducerMap`) is `undefined`, then the identity function is used.

###### EXAMPLE

```js
handleAction('FETCH_DATA', {
  next(state, action) {...},
  throw(state, action) {...},
}, defaultState);
```

If either `next()` or `throw()` are `undefined` or `null`, then the identity function is used for that reducer.

### handleActions

```js
handleActions(reducerMap, defaultState);
```

Creates multiple reducers using `handleAction()` and combines them into a single reducer that handles multiple actions. Accepts a map where the keys are passed as the first parameter to `handleAction()` (the action type), and the values are passed as the second parameter (either a reducer or reducer map). The map must not be empty.

If `reducerMap` has a recursive structure, its leaves are used as reducers, and the action type for each leaf is the path to that leaf. If a node's only children are `next()` and `throw()`, the node will be treated as a reducer. If the leaf is `undefined` or `null`, the identity function is used as the reducer. Otherwise, the leaf should be the reducer function.

```js
import { handleActions } from 'redux-actions';
```

#### `handleActions(reducerMap, defaultState[, options])` {#handleactionsreducermap-defaultstate}

The second parameter `defaultState` is required, and is used when `undefined` is passed to the reducer.

(Internally, `handleActions()` works by applying multiple reducers in sequence using [reduce-reducers](https://github.com/redux-utilities/reduce-reducers).)

###### EXAMPLE

```js
const reducer = handleActions(
  {
    INCREMENT: (state, action) => ({
      counter: state.counter + action.payload
    }),

    DECREMENT: (state, action) => ({
      counter: state.counter - action.payload
    })
  },
  { counter: 0 }
);
```

Or using a JavaScript `Map` type:

```js
const reducer = handleActions(
  new Map([
    [
      INCREMENT,
      (state, action) => ({
        counter: state.counter + action.payload
      })
    ],

    [
      DECREMENT,
      (state, action) => ({
        counter: state.counter - action.payload
      })
    ]
  ]),
  { counter: 0 }
);
```

You can also use an action function as the key to a reduce function instead of using a string const:

```js
const increment = createAction(INCREMENT);
const decrement = createAction(DECREMENT);

const reducer = handleActions(
  new Map([
    [
      increment,
      (state, action) => ({
        counter: state.counter + action.payload
      })
    ],

    [
      decrement,
      (state, action) => ({
        counter: state.counter - action.payload
      })
    ]
  ]),
  { counter: 0 }
);
```

#### `handleActions(actionMap[, defaultState], options)`

You can prefix each action type by passing a configuration object as the last argument of `handleActions`.

###### EXAMPLE

```js
const options = {
  prefix: 'counter', // String used to prefix each type
  namespace: '--' // Separator between prefix and type.  Default: `/`
}

createActions({ ... }, 'INCREMENT', options)

handleActions({ ... }, defaultState, options)
```
