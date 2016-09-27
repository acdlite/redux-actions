import { expect } from 'chai';
import { handleAction, createAction, createActions, combineActions } from '../';

describe('handleAction()', () => {
  const type = 'TYPE';
  const prevState = { counter: 3 };

  describe('single handler form', () => {
    describe('resulting reducer', () => {
      it('returns previous state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', () => null);
        expect(reducer(prevState, { type })).to.equal(prevState);
      });

      it('returns default state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', () => null, { counter: 7 });
        expect(reducer(undefined, { type }))
          .to.deep.equal({
            counter: 7
          });
      });
      it('returns default state if action is empty', () => {
        const reducer = handleAction('NOTTYPE', () => null, { counter: 7 });
        expect(reducer(undefined, {}))
          .to.deep.equal({
            counter: 7
          });
      });

      it('accepts single function as handler', () => {
        const reducer = handleAction(type, (state, action) => ({
          counter: state.counter + action.payload
        }));
        expect(reducer(prevState, { type, payload: 7 }))
          .to.deep.equal({
            counter: 10
          });
      });

      it('accepts action function as action type', () => {
        const incrementAction = createAction(type);
        const reducer = handleAction(incrementAction, (state, action) => ({
          counter: state.counter + action.payload
        }));

        expect(reducer(prevState, incrementAction(7)))
          .to.deep.equal({
            counter: 10
          });
      });

      it('accepts single function as handler and a default state', () => {
        const reducer = handleAction(type, (state, action) => ({
          counter: state.counter + action.payload
        }), { counter: 3 });

        expect(reducer(undefined, { type, payload: 7 }))
          .to.deep.equal({
            counter: 10
          });
      });

      it('should work with createActions action creators', () => {
        const { increment } = createActions('INCREMENT');

        const reducer = handleAction(increment, (state, { payload }) => ({
          counter: state.counter + payload
        }), { counter: 3 });

        expect(reducer(undefined, increment(7)))
          .to.deep.equal({
            counter: 10
          });
      });
    });
  });

  describe('map of handlers form', () => {
    describe('resulting reducer', () => {
      it('returns previous state if type does not match', () => {
        const reducer = handleAction('NOTTYPE', { next: () => null });
        expect(reducer(prevState, { type })).to.equal(prevState);
      });

      it('uses `next()` if action does not represent an error', () => {
        const reducer = handleAction(type, {
          next: (state, action) => ({
            counter: state.counter + action.payload
          })
        });
        expect(reducer(prevState, { type, payload: 7 }))
          .to.deep.equal({
            counter: 10
          });
      });

      it('uses `throw()` if action represents an error', () => {
        const reducer = handleAction(type, {
          throw: (state, action) => ({
            counter: state.counter + action.payload
          })
        });

        expect(reducer(prevState, { type, payload: 7, error: true }))
          .to.deep.equal({
            counter: 10
          });
      });

      it('returns previous state if matching handler is not function', () => {
        const reducer = handleAction(type, { next: null, error: 123 });
        expect(reducer(prevState, { type, payload: 123 })).to.equal(prevState);
        expect(reducer(prevState, { type, payload: 123, error: true }))
          .to.equal(prevState);
      });
    });
  });

  describe('with combined actions', () => {
    it('should handle combined actions in reducer form', () => {
      const action1 = createAction('ACTION_1');
      const reducer = handleAction(
        combineActions(action1, 'ACTION_2', 'ACTION_3'),
        (state, { payload }) => ({ ...state, number: state.number + payload })
      );

      expect(reducer({ number: 1 }, action1(1))).to.deep.equal({ number: 2 });
      expect(reducer({ number: 1 }, { type: 'ACTION_2', payload: 2 })).to.deep.equal({ number: 3 });
      expect(reducer({ number: 1 }, { type: 'ACTION_3', payload: 3 })).to.deep.equal({ number: 4 });
    });

    it('should handle combined actions in next/throw form', () => {
      const action1 = createAction('ACTION_1');
      const reducer = handleAction(combineActions(action1, 'ACTION_2', 'ACTION_3'), {
        next(state, { payload }) {
          return { ...state, number: state.number + payload };
        }
      });

      expect(reducer({ number: 1 }, action1(1))).to.deep.equal({ number: 2 });
      expect(reducer({ number: 1 }, { type: 'ACTION_2', payload: 2 })).to.deep.equal({ number: 3 });
      expect(reducer({ number: 1 }, { type: 'ACTION_3', payload: 3 })).to.deep.equal({ number: 4 });
    });

    it('should handle combined error actions', () => {
      const action1 = createAction('ACTION_1');
      const reducer = handleAction(combineActions(action1, 'ACTION_2', 'ACTION_3'), {
        next(state, { payload }) {
          return { ...state, number: state.number + payload };
        },

        throw(state) {
          return { ...state, threw: true };
        }
      });
      const error = new Error;

      expect(reducer({ number: 0 }, action1(error)))
        .to.deep.equal({ number: 0, threw: true });
      expect(reducer({ number: 0 }, { type: 'ACTION_2', payload: error, error: true }))
        .to.deep.equal({ number: 0, threw: true });
      expect(reducer({ number: 0 }, { type: 'ACTION_3', payload: error, error: true }))
        .to.deep.equal({ number: 0, threw: true });
    });

    it('should return previous state if action is not one of the combined actions', () => {
      const reducer = handleAction(
        combineActions('ACTION_1', 'ACTION_2'),
        (state, { payload }) => ({ ...state, state: state.number + payload }),
      );

      const state = { number: 0 };

      expect(reducer(state, { type: 'ACTION_3', payload: 1 })).to.equal(state);
    });

    it('should use the default state if the initial state is undefined', () => {
      const reducer = handleAction(
        combineActions('INCREMENT', 'DECREMENT'),
        (state, { payload }) => ({ ...state, counter: state.counter + payload }),
        { counter: 10 }
      );

      expect(reducer(undefined, { type: 'INCREMENT', payload: +1 })).to.deep.equal({ counter: 11 });
      expect(reducer(undefined, { type: 'DECREMENT', payload: -1 })).to.deep.equal({ counter: 9 });
    });

    it('should handle combined actions with symbols', () => {
      const action1 = createAction('ACTION_1');
      const action2 = Symbol('ACTION_2');
      const action3 = createAction(Symbol('ACTION_3'));
      const reducer = handleAction(
        combineActions(action1, action2, action3),
        (state, { payload }) => ({ ...state, number: state.number + payload })
      );

      expect(reducer({ number: 0 }, action1(1)))
        .to.deep.equal({ number: 1 });
      expect(reducer({ number: 0 }, { type: action2, payload: 2 }))
        .to.deep.equal({ number: 2 });
      expect(reducer({ number: 0 }, { type: Symbol('ACTION_3'), payload: 3 }))
        .to.deep.equal({ number: 3 });
    });
  });
});
