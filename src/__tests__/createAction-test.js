import { createAction } from '../';
import identity from '../identity';
import isPlainObject from 'lodash.isplainobject';

describe('createAction()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE';

    it('returns plain object', () => {
      const actionCreator = createAction(type, identity);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(isPlainObject(action)).to.be.true;
    });

    it('uses return value as payload', () => {
      const actionCreator = createAction(type, identity);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action.payload).to.equal(foobar);
    });

    it('has no extraneous keys', () => {
      const actionCreator = createAction(type, identity);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      });
    });

    it('uses identity function if actionCreator is not a function', () => {
      const actionCreator = createAction(type);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
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
          cid: 5,
        },
      });
    });
  });
});
