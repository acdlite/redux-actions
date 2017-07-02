# redux-actions

[![build status](https://img.shields.io/travis/acdlite/redux-actions/master.svg?style=flat-square)](https://travis-ci.org/acdlite/redux-actions)

[![NPM](https://nodei.co/npm/redux-actions.png?downloads=true)](https://nodei.co/npm/redux-actions/)

[Flux Standard Action](https://github.com/acdlite/flux-standard-action) utilities for Redux.

## Installation

```bash
npm install --save redux-actions
```

The [npm](https://www.npmjs.com) package provides a [CommonJS](http://webpack.github.io/docs/commonjs.html) build for use in Node.js, and with bundlers like [Webpack](http://webpack.github.io/) and [Browserify](http://browserify.org/). It also includes an [ES modules](http://jsmodules.io/) build that works well with [Rollup](http://rollupjs.org/) and [Webpack2](https://webpack.js.org)'s tree-shaking.

If you don’t use [npm](https://www.npmjs.com), you may grab the latest [UMD](https://unpkg.com/redux-actions@latest/dist) build from [unpkg](https://unpkg.com) (either a [development](https://unpkg.com/redux-actions@latest/dist/redux-actions.js) or a [production](https://unpkg.com/redux-actions@latest/dist/redux-actions.min.js) build). The UMD build exports a global called `window.ReduxActions` if you add it to your page via a `<script>` tag. We *don’t* recommend UMD builds for any serious application, as most of the libraries complementary to Redux are only available on [npm](https://www.npmjs.com/search?q=redux).

## Usage

### `createAction(type, payloadCreator = Identity, ?metaCreator)`

```js
import { createAction } from 'redux-actions';
```

Wraps an action creator so that its return value is the payload of a Flux Standard Action.

`payloadCreator` must be a function, `undefined`, or `null`. If `payloadCreator` is `undefined` or `null`, the identity function is used.

Example:

```js
let noop = createAction('NOOP', amount => amount);
// same as
noop = createAction('NOOP');

expect(noop(42)).to.deep.equal({
  type: 'NOOP',
  payload: 42
});
```

If the payload is an instance of an [Error
object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error),
redux-actions will automatically set ```action.error``` to true.

Example:

```js
const noop = createAction('NOOP');

const error = new TypeError('not a number');
expect(noop(error)).to.deep.equal({
  type: 'NOOP',
  payload: error,
  error: true
});
```

`createAction` also returns its `type` when used as type in `handleAction` or `handleActions`.

Example:

```js
const noop = createAction('INCREMENT');

// As parameter in handleAction:
handleAction(noop, {
  next(state, action) {...},
  throw(state, action) {...}
});

// As object key in handleActions:
const reducer = handleActions({
  [noop]: (state, action) => ({
    counter: state.counter + action.payload
  })
}, { counter: 0 });
```

**NOTE:** The more correct name for this function is probably `createActionCreator()`, but that seems a bit redundant.

Use the identity form to create one-off actions:

```js
createAction('ADD_TODO')('Use Redux');
```

`metaCreator` is an optional argument that can either be an object or a function. An object will be directly used as meta value in the payload, whereas a function receives the same arguments as the payload creator and its return value will be used as meta value. If `metaCreator` is not defined, the meta property will be omitted.

### `createActions(?actionMap, ?...identityActions)`

```js
import { createActions } from 'redux-actions';
```

Returns an object mapping action types to action creators. The keys of this object are camel-cased from the keys in `actionMap` and the string literals of `identityActions`; the values are the action creators.

`actionMap` is an optional object and a recursive data structure, with action types as keys, and whose values **must** be either

- a function, which is the payload creator for that action
- an array with `payload` and `meta` functions in that order, as in [`createAction`](#createactiontype-payloadcreator--identity-metacreator)
    - `meta` is **required** in this case (otherwise use the function form above)
- an `actionMap`

`identityActions` is an optional list of positional string arguments that are action type strings; these action types will use the identity payload creator.


```js
const { actionOne, actionTwo, actionThree } = createActions({
  // function form; payload creator defined inline
  ACTION_ONE: (key, value) => ({ [key]: value }),

  // array form
  ACTION_TWO: [
    (first) => [first],             // payload
    (first, second) => ({ second }) // meta
  ],

  // trailing action type string form; payload creator is the identity
}, 'ACTION_THREE');

expect(actionOne('key', 1)).to.deep.equal({
  type: 'ACTION_ONE',
  payload: { key: 1 }
});

expect(actionTwo('first', 'second')).to.deep.equal({
  type: 'ACTION_TWO',
  payload: ['first'],
  meta: { second: 'second' }
});

expect(actionThree(3)).to.deep.equal({
  type: 'ACTION_THREE',
  payload: 3,
});
```

If `actionMap` has a recursive structure, its leaves are used as payload and meta creators, and the action type for each leaf is the combined path to that leaf:

```js
const actionCreators = createActions({
  APP: {
    COUNTER: {
      INCREMENT: [
        amount => ({ amount }),
        amount => ({ key: 'value', amount })
      ],
      DECREMENT: amount => ({ amount: -amount }),
      SET: undefined // given undefined, the identity function will be used
    },
    NOTIFY: [
      (username, message) => ({ message: `${username}: ${message}` }),
      (username, message) => ({ username, message })
    ]
  }
});

expect(actionCreators.app.counter.increment(1)).to.deep.equal({
  type: 'APP/COUNTER/INCREMENT',
  payload: { amount: 1 },
  meta: { key: 'value', amount: 1 }
});
expect(actionCreators.app.counter.decrement(1)).to.deep.equal({
  type: 'APP/COUNTER/DECREMENT',
  payload: { amount: -1 }
});
expect(actionCreators.app.counter.set(100)).to.deep.equal({
  type: 'APP/COUNTER/SET',
  payload: 100
});
expect(actionCreators.app.notify('yangmillstheory', 'Hello World')).to.deep.equal({
  type: 'APP/NOTIFY',
  payload: { message: 'yangmillstheory: Hello World' },
  meta: { username: 'yangmillstheory', message: 'Hello World' }
});
```
When using this form, you can pass an object with key `namespace` as the last positional argument (the default is `/`).

### `handleAction(type, reducer | reducerMap = Identity, defaultState)`

```js
import { handleAction } from 'redux-actions';
```

Wraps a reducer so that it only handles Flux Standard Actions of a certain type.

If a `reducer` function is passed, it is used to handle both normal actions and failed actions. (A failed action is analogous to a rejected promise.) You can use this form if you know a certain type of action will never fail, like the increment example above.

Otherwise, you can specify separate reducers for `next()` and `throw()` using the `reducerMap` form. This API is inspired by the ES6 generator interface.

```js
handleAction('FETCH_DATA', {
  next(state, action) {...},
  throw(state, action) {...}
}, defaultState);
```

If either `next()` or `throw()` are `undefined` or `null`, then the identity function is used for that reducer.

If the reducer argument (`reducer | reducerMap`) is `undefined`, then the identity function is used.

The third parameter `defaultState` is required, and is used when `undefined` is passed to the reducer.

### `handleActions(reducerMap, defaultState, )`

```js
import { handleActions } from 'redux-actions';
```

Creates multiple reducers using `handleAction()` and combines them into a single reducer that handles multiple actions. Accepts a map where the keys are passed as the first parameter to `handleAction()` (the action type), and the values are passed as the second parameter (either a reducer or reducer map). The map must not be empty.

If `reducerMap` has a recursive structure, its leaves are used as reducers, and the action type for each leaf is the path to that leaf. If a node's only children are `next()` and `throw()`, the node will be treated as a reducer. If the leaf is `undefined` or `null`, the identity function is used as the reducer. Otherwise, the leaf should be the reducer function. When using this form, you can pass an object with key `namespace` as the last positional argument (the default is `/`).

The second parameter `defaultState` is required, and is used when `undefined` is passed to the reducer.

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

### `combineActions(...types)`

Combine any number of action types or action creators. `types` is a list of positional arguments which can be action type strings, symbols, or action creators.

This allows you to reduce multiple distinct actions with the same reducer.

```js
const { increment, decrement } = createActions({
  INCREMENT: amount => ({ amount }),
  DECREMENT: amount => ({ amount: -amount }),
})

const reducer = handleAction(combineActions(increment, decrement), {
  next: (state, { payload: { amount } }) => ({ ...state, counter: state.counter + amount }),
  throw: state => ({ ...state, counter: 0 }),
}, { counter: 10 })

expect(reducer(undefined, increment(1)).to.deep.equal({ counter: 11 })
expect(reducer(undefined, decrement(1)).to.deep.equal({ counter: 9 })
expect(reducer(undefined, increment(new Error)).to.deep.equal({ counter: 0 })
expect(reducer(undefined, decrement(new Error)).to.deep.equal({ counter: 0 })
```

Here's an example using `handleActions`:

```js
const { increment, decrement } = createActions({
  INCREMENT: amount => ({ amount }),
  DECREMENT: amount => ({ amount: -amount })
});

const reducer = handleActions({
  [combineActions(increment, decrement)](state, { payload: { amount } }) {
    return { ...state, counter: state.counter + amount };
  }
}, { counter: 10 });

expect(reducer({ counter: 5 }, increment(5))).to.deep.equal({ counter: 10 });
expect(reducer({ counter: 5 }, decrement(5))).to.deep.equal({ counter: 0 });
expect(reducer({ counter: 5 }, { type: 'NOT_TYPE', payload: 1000 })).to.equal({ counter: 5 });
expect(reducer(undefined, increment(5))).to.deep.equal({ counter: 15 });
```

## Usage with middleware

redux-actions is handy all by itself, however, its real power comes when you combine it with middleware.

The identity form of `createAction` is a great way to create a single action creator that handles multiple payload types. For example, using [redux-promise](https://github.com/acdlite/redux-promise) and [redux-rx](https://github.com/acdlite/redux-rx):

```js
const addTodo = createAction('ADD_TODO');

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
