import {test, describe} from "node:test"
import assert from "node:assert/strict";
import { splitByLeadingElem, splitByTrailingElem } from "../../src/util";

describe("splitByXXX tests", () => {

  function isBreak(value) {
    return value.startsWith("#");
  }

  describe("excludeMatch", () => {
    const cases = [
      {name: "Empty list", input: [], leading: [], trailing: []},
      {name: "No matches", input: ["a", "b"], leading: [["a", "b"]], trailing: [["a", "b"]]},
      {name: "Interior matches", input: ["a", "#1", "b", "#2", "c"], leading: [["a"], ["b"], ["c"]], trailing: [["a"], ["b"], ["c"]]},
      {name: "Leading match", input: ["#1", "a"], leading: [["a"]], trailing: [[], ["a"]]},
      {name: "Consecutive leading matches", input: ["#1", "#2", "a"], leading: [[], ["a"]], trailing: [[], [], ["a"]]},
      {name: "Trailing match", input: ["a", "#1"], leading: [["a"], []], trailing: [["a"]]},
      {name: "Consecutive trailing matches", input: ["a", "#1", "#2"], leading: [["a"], [], []], trailing: [["a"], []]},
      {name: "Consecutive matches", input: ["a", "#1", "#2", "b"], leading: [["a"], [], ["b"]], trailing: [["a"], [], ["b"]]},
      {name: "Single match", input: ["#1"], leading: [[]], trailing: [[]]},
      {name: "Only matches", input: ["#1", "#2"], leading: [[], []], trailing: [[], []]},
    ];

    for (const {name, input, leading, trailing} of cases) {
      test(name, () => {
        // Excluding matches preserves the groups they start or end,
        // even when removing the match leaves a group empty.
        assert.deepEqual(splitByLeadingElem(input, isBreak, {excludeMatch: true}), leading);
        assert.deepEqual(splitByTrailingElem(input, isBreak, {excludeMatch: true}), trailing);
      });
    }

    test("Explicit false retains matched elements", () => {
      const input = ["a", "#1", "b"];
      assert.deepEqual(
        splitByLeadingElem(input, isBreak, {excludeMatch: false}),
        [["a"], ["#1", "b"]],
      );
      assert.deepEqual(
        splitByTrailingElem(input, isBreak, {excludeMatch: false}),
        [["a", "#1"], ["b"]],
      );
    });
  });

  test("No matches", () => {
    assert.deepEqual(
      splitByLeadingElem(["a", "b"], isBreak),
      [["a", "b"]],
      "Leading split should keep list together when nothing matches",
    );

    assert.deepEqual(
      splitByTrailingElem(["a", "b"], isBreak),
      [["a", "b"]],
      "Trailing split should keep list together when nothing matches",
    );
  })

  test("Leading matches", () => {
    assert.deepEqual(
      splitByLeadingElem(["a", "#1", "b", "#2", "c"], isBreak),
      [["a"], ["#1", "b"], ["#2", "c"]],
      "Leading split should keep matched elements as group heads",
    );

    assert.deepEqual(
      splitByLeadingElem(["#1", "a"], isBreak),
      [["#1", "a"]],
      "Leading split should not create an empty group before a leading head",
    );

    assert.deepEqual(
      splitByLeadingElem(["a", "#1"], isBreak),
      [["a"], ["#1"]],
      "Leading split should start a new group when the last element matches",
    );
  })

  test("Trailing matches", () => {
    assert.deepEqual(
      splitByTrailingElem(["a", "#1", "b", "#2", "c"], isBreak),
      [["a", "#1"], ["b", "#2"], ["c"]],
      "Trailing split should keep matched elements as group tails",
    );

    assert.deepEqual(
      splitByTrailingElem(["#1", "a"], isBreak),
      [["#1"], ["a"]],
      "Trailing split should return a leading matched element as its own group",
    );

    assert.deepEqual(
      splitByTrailingElem(["a", "#1"], isBreak),
      [["a", "#1"]],
      "Trailing split should not create an empty group after a trailing separator",
    );
  })

  test("Consecutive matches", () => {
    assert.deepEqual(
      splitByLeadingElem(["#1", "#2", "a"], isBreak),
      [["#1"], ["#2", "a"]],
      "Leading split should start a new group at each consecutive head",
    );

    assert.deepEqual(
      splitByTrailingElem(["#1", "#2", "a"], isBreak),
      [["#1"], ["#2"], ["a"]],
      "Trailing split should end a group at each consecutive separator",
    );
  })

  test("Empty list", () => {
    assert.deepEqual(
      splitByLeadingElem([], isBreak),
      [],
      "Leading split should return no groups for an empty list",
    );

    assert.deepEqual(
      splitByTrailingElem([], isBreak),
      [],
      "Trailing split should return no groups for an empty list",
    );
  })
})
