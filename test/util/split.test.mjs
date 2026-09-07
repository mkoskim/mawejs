import {test, describe} from "node:test"
import assert from "node:assert/strict";
import { splitByLeadingElem, splitByTrailingElem } from "../../src/util";

describe("splitByXXX tests", () => {

  function isBreak(value) {
    return value.startsWith("#");
  }

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
