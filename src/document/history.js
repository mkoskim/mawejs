//-----------------------------------------------------------------------------
// History entry date stamps
//-----------------------------------------------------------------------------

export function createDateStamp(date) {
  if(!date) date = new Date()
  return date.toISOString().split("T")[0]
}

//-----------------------------------------------------------------------------
// Document history management
//-----------------------------------------------------------------------------

export function updateWordsHistory(history, date, words) {
  if(!date) date = createDateStamp()

  return [
    ...history.length ? [] : [zeroWords(previousDate(date))],
    ...history.filter(entry => entry.type !== "words" || entry.date < date),
    { type: "words", date, ...words },
  ];
}

export function referenceWords(history, date) {
  if(!date) date = createDateStamp()
  return history.findLast(entry => entry.type === "words" && entry.date < date)
    ?? zeroWords(previousDate(date));
}

//-----------------------------------------------------------------------------

function previousDate(date) {
  const prev = new Date(`${date}T12:00:00`);
  prev.setDate(prev.getDate() - 1);
  return prev.toISOString().split("T")[0];
}

function zeroWords(date) {
  return {
    type: "words",
    date,
    text: 0,
    missing: 0,
    chars: 0,
  };
}
