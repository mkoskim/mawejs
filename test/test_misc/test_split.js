import assert from "node:assert/strict";
import { splitByLeadingElem, splitByTrailingElem } from "../../src/util";

console.log("Split test...");

testNoMatches();
testLeadingMatches();
testTrailingMatches();
testConsecutiveMatches();
testEmptyList();

console.log("Split test passed");

function testNoMatches() {
  assert.deepEqual(
    splitByLeadingElem(["a", "b"], isBreak),
    [["a", "b"]],
    "leading split should keep list together when nothing matches",
  );

  assert.deepEqual(
    splitByTrailingElem(["a", "b"], isBreak),
    [["a", "b"]],
    "trailing split should keep list together when nothing matches",
  );
}

function testLeadingMatches() {
  assert.deepEqual(
    splitByLeadingElem(["a", "#1", "b", "#2", "c"], isBreak),
    [["a"], ["#1", "b"], ["#2", "c"]],
    "leading split should keep matched elements as group heads",
  );

  assert.deepEqual(
    splitByLeadingElem(["#1", "a"], isBreak),
    [["#1", "a"]],
    "leading split should not create an empty group before a leading head",
  );

  assert.deepEqual(
    splitByLeadingElem(["a", "#1"], isBreak),
    [["a"], ["#1"]],
    "leading split should start a new group when the last element matches",
  );
}

function testTrailingMatches() {
  assert.deepEqual(
    splitByTrailingElem(["a", "#1", "b", "#2", "c"], isBreak),
    [["a", "#1"], ["b", "#2"], ["c"]],
    "trailing split should keep matched elements as group tails",
  );

  assert.deepEqual(
    splitByTrailingElem(["#1", "a"], isBreak),
    [["#1"], ["a"]],
    "trailing split should return a leading matched element as its own group",
  );

  assert.deepEqual(
    splitByTrailingElem(["a", "#1"], isBreak),
    [["a", "#1"]],
    "trailing split should not create an empty group after a trailing separator",
  );
}

function testConsecutiveMatches() {
  assert.deepEqual(
    splitByLeadingElem(["#1", "#2", "a"], isBreak),
    [["#1"], ["#2", "a"]],
    "leading split should start a new group at each consecutive head",
  );

  assert.deepEqual(
    splitByTrailingElem(["#1", "#2", "a"], isBreak),
    [["#1"], ["#2"], ["a"]],
    "trailing split should end a group at each consecutive separator",
  );
}

function testEmptyList() {
  assert.deepEqual(
    splitByLeadingElem([], isBreak),
    [],
    "leading split should return no groups for an empty list",
  );

  assert.deepEqual(
    splitByTrailingElem([], isBreak),
    [],
    "trailing split should return no groups for an empty list",
  );
}

function isBreak(value) {
  return value.startsWith("#");
}
