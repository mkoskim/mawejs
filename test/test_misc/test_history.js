import assert from "node:assert/strict";
import {
  referenceWords,
  updateWordsHistory,
} from "../../src/document/history.js";

//*****************************************************************************
// History test data
//*****************************************************************************

const HISTORY = [
  words("1995-03-14", 1000),
  words("1996-06-06", 2000),
  words("1997-12-21", 3000),
  words("1999-09-09", 4000),
  words("2000-02-02", 5000),
  words("2003-10-02", 6000),
  words("2005-05-30", 7000),
  words("2007-01-28", 8000),
  words("2011-04-17", 9000),
  words("2013-11-11", 10000),
  words("2016-02-29", 11000),
  words("2018-07-19", 12000),
  words("2021-08-08", 13000),
  words("2024-12-31", 14000),
  words("2026-05-01", 15000),
  words("2027-03-18", 16000),
  words("2029-06-23", 17000),
  words("2030-01-15", 18000),
  words("2032-11-05", 19000),
  words("2032-12-24", 20000),
];

function words(date, count) {
  return {
    type: "words",
    date,
    text: count,
    missing: count,
    chars: count * 6,
  };
}

//*****************************************************************************
// History test
//*****************************************************************************

console.log("History test...");

await testUpdateWordsHistory();
await testUpdateEmptyWordsHistory();
await testReferenceWords();
await testReferenceAfterMidnight();

console.log("History test passed");

//*****************************************************************************
// Test, that updating words changes returns correct history array.
//*****************************************************************************

function testUpdateWordsHistory() {
  console.log("- Test updating words history...");

  const history = updateWordsHistory(HISTORY, "2008-05-01", {
    text: 12345,
    missing: 23456,
    chars: 34567,
  });

  assert.deepEqual(history.map(entry => entry.date), [
    "1995-03-14",
    "1996-06-06",
    "1997-12-21",
    "1999-09-09",
    "2000-02-02",
    "2003-10-02",
    "2005-05-30",
    "2007-01-28",
    "2008-05-01"
  ]);

  assert.deepEqual(history.at(-1), {
    type: "words",
    date: "2008-05-01",
    text: 12345,
    missing: 23456,
    chars: 34567,
  });
}

//*****************************************************************************
// Test, that empty history update creates previous day zero words.
//*****************************************************************************

function testUpdateEmptyWordsHistory() {
  console.log("- Test updating empty words history...");

  const history = updateWordsHistory([], "2026-05-01", {
    text: 12345,
    missing: 23456,
    chars: 34567,
  });

  assert.deepEqual(history, [
    words("2026-04-30", 0),
    {
      type: "words",
      date: "2026-05-01",
      text: 12345,
      missing: 23456,
      chars: 34567,
    }
  ]);
}

//*****************************************************************************
// Test, that reference words return previous entry or fallback current words.
//*****************************************************************************

function testReferenceWords() {
  console.log("- Test reference words...");

  assert.deepEqual(
    referenceWords(HISTORY, "2026-05-01"),
    words("2024-12-31", 14000)
  );

  assert.deepEqual(
    referenceWords(HISTORY, "1995-03-14"),
    words("1995-03-13", 0)
  );
}

//*****************************************************************************
// Test, that yesterday's saved words become the reference after midnight.
//*****************************************************************************

function testReferenceAfterMidnight() {
  console.log("- Test reference after midnight...");

  const day1Words = {
    text: 22222,
    missing: 33333,
    chars: 44444,
  };

  const day1UpdatedWords = {
    text: 22333,
    missing: 33444,
    chars: 44555,
  };

  const day2Words = {
    text: 23456,
    missing: 34567,
    chars: 45678,
  };

  const day1History = updateWordsHistory(HISTORY, "2007-01-28", day1Words);

  assert.deepEqual(
    day1History.map(entry => entry.date),
    [
      "1995-03-14",
      "1996-06-06",
      "1997-12-21",
      "1999-09-09",
      "2000-02-02",
      "2003-10-02",
      "2005-05-30",
      "2007-01-28",
    ]
  );

  assert.deepEqual(
    referenceWords(day1History, "2007-01-28"),
    words("2005-05-30", 7000)
  );

  const day1UpdatedHistory = updateWordsHistory(day1History, "2007-01-28", day1UpdatedWords);

  assert.deepEqual(
    day1UpdatedHistory.map(entry => entry.date),
    [
      "1995-03-14",
      "1996-06-06",
      "1997-12-21",
      "1999-09-09",
      "2000-02-02",
      "2003-10-02",
      "2005-05-30",
      "2007-01-28",
    ]
  );

  assert.deepEqual(day1UpdatedHistory.at(-1), {
    type: "words",
    date: "2007-01-28",
    ...day1UpdatedWords,
  });

  assert.deepEqual(
    referenceWords(day1UpdatedHistory, "2007-01-28"),
    words("2005-05-30", 7000)
  );

  const day2History = updateWordsHistory(day1UpdatedHistory, "2007-01-29", day2Words);

  assert.deepEqual(
    day2History.map(entry => entry.date),
    [
      "1995-03-14",
      "1996-06-06",
      "1997-12-21",
      "1999-09-09",
      "2000-02-02",
      "2003-10-02",
      "2005-05-30",
      "2007-01-28",
      "2007-01-29",
    ]
  );

  assert.deepEqual(day2History.at(-1), {
    type: "words",
    date: "2007-01-29",
    ...day2Words,
  });

  assert.deepEqual(
    referenceWords(day2History, "2007-01-29"),
    {
      type: "words",
      date: "2007-01-28",
      ...day1UpdatedWords,
    }
  );
}
