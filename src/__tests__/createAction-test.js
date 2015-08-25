import { createAction } from '../';
import isPlainObject from 'lodash.isplainobject';

describe('createAction()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE';

    it('returns plain object', () => {
      const actionCreator = createAction(type, b => b);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(isPlainObject(action)).to.be.true;
    });

    it('uses return value as payload', () => {
      const actionCreator = createAction(type, b => b);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action.payload).to.equal(foobar);
    });

    it('has no extraneous keys', () => {
      const actionCreator = createAction(type, b => b);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar
      });
    });

    it('uses identity function if actionCreator is not a function', () => {
      const actionCreator = createAction(type);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar
      });
    });

    it('accepts a second parameter for adding meta to object', () => {
      const actionCreator = createAction(type, null, ({ cid }) => ({ cid }));
      const foobar = { foo: 'bar', cid: 5 };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
        meta: {
          cid: 5
        }
      });
    });
  });

  it('throws an error when it\'s passed undefined as a type', () => {
    const func = () => createAction();
    expect(func).to.throw('createAction requires a type as the first argument');
  });
});
