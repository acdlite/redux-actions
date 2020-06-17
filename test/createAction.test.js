import { isFSA } from 'flux-standard-action';
import createAction from '../src/createAction';

const type = 'TYPE';

test('returns a valid FSA', () => {
  const actionCreator = createAction(type, b => b);
  const foobar = { foo: 'bar' };
  const action = actionCreator(foobar);
  expect(isFSA(action)).toBeTruthy();
});

test('uses return value as payload', () => {
  const actionCreator = createAction(type, b => b);
  const foobar = { foo: 'bar' };
  const action = actionCreator(foobar);
  expect(action).toEqual({
    type,
    payload: foobar
  });
});

test('throws an error if payloadCreator is not a function, undefined, null', () => {
  const wrongTypePayloadCreators = [1, false, 'string', {}, []];

  wrongTypePayloadCreators.forEach(wrongTypePayloadCreator => {
    expect(() => {
      createAction(type, wrongTypePayloadCreator);
    }).toThrow('Expected payloadCreator to be a function, undefined or null');
  });
});

test('uses identity function if payloadCreator is undefined', () => {
  const actionCreator = createAction(type);
  const foobar = { foo: 'bar' };
  const action = actionCreator(foobar);
  expect(action).toEqual({
    type,
    payload: foobar
  });
  expect(isFSA(action)).toBeTruthy();
});

test('uses identity function if payloadCreator is null', () => {
  const actionCreator = createAction(type, null);
  const foobar = { foo: 'bar' };
  const action = actionCreator(foobar);
  expect(action).toEqual({
    type,
    payload: foobar
  });
  expect(isFSA(action)).toBeTruthy();
});

test('accepts a second parameter for adding meta to object', () => {
  const actionCreator = createAction(type, undefined, ({ cid }) => ({ cid }));
  const foobar = { foo: 'bar', cid: 5 };
  const action = actionCreator(foobar);
  expect(action).toEqual({
    type,
    payload: foobar,
    meta: {
      cid: 5
    }
  });
  expect(isFSA(action)).toBeTruthy();
});

test('sets error to true if payload is an Error object', () => {
  const actionCreator = createAction(type);
  const errObj = new TypeError('this is an error');

  const errAction = actionCreator(errObj);
  expect(errAction).toEqual({
    type,
    payload: errObj,
    error: true
  });
  expect(isFSA(errAction)).toBeTruthy();

  const foobar = { foo: 'bar', cid: 5 };
  const noErrAction = actionCreator(foobar);
  expect(noErrAction).toEqual({
    type,
    payload: foobar
  });
  expect(isFSA(noErrAction)).toBeTruthy();
});

test('sets error to true if payload is an Error object and meta is provided', () => {
  const actionCreator = createAction(type, undefined, (_, meta) => meta);
  const errObj = new TypeError('this is an error');

  const errAction = actionCreator(errObj, { foo: 'bar' });
  expect(errAction).toEqual({
    type,
    payload: errObj,
    error: true,
    meta: { foo: 'bar' }
  });
});

test('sets payload only when defined', () => {
  const action = createAction(type)();
  expect(action).toEqual({
    type
  });

  const explictUndefinedAction = createAction(type)(undefined);
  expect(explictUndefinedAction).toEqual({
    type
  });

  const baz = '1';
  const actionCreator = createAction(type, undefined, () => ({ bar: baz }));
  expect(actionCreator()).toEqual({
    type,
    meta: {
      bar: '1'
    }
  });

  const validPayload = [false, 0, ''];
  for (let i = 0; i < validPayload.length; i++) {
    const validValue = validPayload[i];
    const expectPayload = createAction(type)(validValue);
    expect(expectPayload).toEqual({
      type,
      payload: validValue
    });
  }
});

test('bypasses payloadCreator if payload is an Error object', () => {
  const actionCreator = createAction(
    type,
    () => 'not this',
    (_, meta) => meta
  );
  const errObj = new TypeError('this is an error');

  const errAction = actionCreator(errObj, { foo: 'bar' });
  expect(errAction).toEqual({
    type,
    payload: errObj,
    error: true,
    meta: { foo: 'bar' }
  });
});

test('sets error to true if payloadCreator return an Error object', () => {
  const errObj = new TypeError('this is an error');
  const actionCreator = createAction(type, () => errObj);
  const errAction = actionCreator('invalid arguments');
  expect(errAction).toEqual({
    type,
    payload: errObj,
    error: true
  });
});
