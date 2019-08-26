import assert from 'assert';
import lodashStable from 'lodash';
import { _, add, square, noop, identity, LARGE_ARRAY_SIZE, isEven, isNpm } from './utils.js';
import times from '../times.js';
import head from '../head.js';
import filter from '../filter.js';
import map from '../map.js';
import take from '../take.js';
import compact from '../compact.js';
import uniq from '../uniq.js';
import flow from '../flow.js';
import flowRight from '../flowRight.js';

const methods = {
  flow,
  flowRight
}

describe('flow methods', function() {
  lodashStable.each(['flow', 'flowRight'], function(methodName) {
    var func = methods[methodName],
        isFlow = methodName == 'flow';

    it('`_.' + methodName + '` should supply each function with the return value of the previous', function() {
      var fixed = function(n) { return n.toFixed(1); },
          combined = isFlow ? func(add, square, fixed) : func(fixed, square, add);

      assert.strictEqual(combined(1, 2), '9.0');
    });

    it('`_.' + methodName + '` should return a new function', function() {
      assert.notStrictEqual(func(noop), noop);
    });

    it('`_.' + methodName + '` should return an identity function when no arguments are given', function() {
      times(2, function(index) {
        try {
          var combined = index ? func([]) : func();
          assert.strictEqual(combined('a'), 'a');
        } catch (e) {
          assert.ok(false, e.message);
        }
        assert.strictEqual(combined.length, 0);
        assert.notStrictEqual(combined, identity);
      });
    });

    it('`_.' + methodName + '` should work with a curried function and `_.head`', function() {
      var curried = lodashStable.curry(identity);

      var combined = isFlow
        ? func(head, curried)
        : func(curried, head);

      assert.strictEqual(combined([1]), 1);
    });

    it('`_.' + methodName + '` should support shortcut fusion', function() {
      var filterCount,
          mapCount,
          array = lodashStable.range(LARGE_ARRAY_SIZE),
          iteratee = function(value) { mapCount++; return square(value); },
          predicate = function(value) { filterCount++; return isEven(value); };

      lodashStable.times(2, function(index) {
        var filter1 = filter,
            filter2 = lodashStable.curry(lodashStable.rearg(lodashStable.ary(filter, 2), 1, 0), 2),
            filter3 = (index ? filter2 : filter1, filter2(predicate));

        var map1 = map,
            map2 = lodashStable.curry(lodashStable.rearg(lodashStable.ary(map, 2), 1, 0), 2),
            map3 = (index ? map2 : map1, map2(iteratee));

        var take1 = take,
            take2 = lodashStable.curry(lodashStable.rearg(lodashStable.ary(take, 2), 1, 0), 2),
            take3 = (index ? take2 : take1, take2(2));

        var combined = isFlow
          ? func(map3, filter3, compact, take3)
          : func(take3, compact, filter3, map3);

        filterCount = mapCount = 0;
        assert.deepStrictEqual(combined(array), [4, 16]);

        if (!isNpm && WeakMap && WeakMap.name) {
          assert.strictEqual(filterCount, 5, 'filterCount');
          assert.strictEqual(mapCount, 5, 'mapCount');
        }        
      });
    });

    it('`_.' + methodName + '` should work with curried functions with placeholders', function() {
      var curried = lodashStable.curry(lodashStable.ary(map, 2), 2),
          getProp = curried(curried.placeholder, (value) => value.a),
          objects = [{ 'a': 1 }, { 'a': 2 }, { 'a': 1 }];

      var combined = isFlow
        ? func(getProp, uniq)
        : func(uniq, getProp);

      assert.deepStrictEqual(combined(objects), [1, 2]);
    });
  });
});
