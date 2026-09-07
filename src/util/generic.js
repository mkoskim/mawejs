//*****************************************************************************
//*****************************************************************************
//
// Some generic utils
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------

export const isEmpty = x => !x;
export const isNotEmpty = x => !!x;

//-----------------------------------------------------------------------------

export function isObject(a) {
  return (
    typeof a === "object" &&
    a !== null &&
    !Array.isArray(a)
  )
}

//-----------------------------------------------------------------------------
// Number formatting
//-----------------------------------------------------------------------------

export const numfmt = {
  group: Intl.NumberFormat(undefined, {useGrouping: true}),
  sign:  Intl.NumberFormat(undefined, {signDisplay: "always"}),
  gsign: Intl.NumberFormat(undefined, {signDisplay: "always", useGrouping: true}),
}

export function textToInt(text) {
  if(!text) return undefined
  const number = parseInt(text.trim())
  return isNaN(number) ? undefined : number
}

//-----------------------------------------------------------------------------
// sleep
//-----------------------------------------------------------------------------

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//-----------------------------------------------------------------------------
// Text splitting
//-----------------------------------------------------------------------------

export function text2lines(content, linebreak = "\n\n") {
  return content
    .replaceAll("\r", "")
    .split(linebreak)
    .map(line => line.replaceAll(/\s+/g, " ").trim())
}

const reSplit2Words = new RegExp(/[^\p{L}\p{N}]+/, "iu")

export function text2words(text) {
  //return text.split(/[^\wåäö]+/i).filter(word => word.length)
  return text.split(reSplit2Words).filter(word => word.length)
}

export function wordcount(text) {
  return text2words(text).length
}

//-----------------------------------------------------------------------------
// Split list to groups starting by a specific element
//-----------------------------------------------------------------------------

export function splitByLeadingElem(list, match) {
  const groups = [];
  let group = [];

  for(const elem of list) {
    if(match(elem) && group.length) {
      groups.push(group);
      group = [];
    }
    group.push(elem);
  }

  if(group.length) groups.push(group);
  return groups;
}

//-----------------------------------------------------------------------------
// Split list to groups ending with a specific element
//-----------------------------------------------------------------------------

export function splitByTrailingElem(list, match) {
  const groups = [];
  let group = [];

  for(const elem of list) {
    group.push(elem);

    if(match(elem)) {
      groups.push(group);
      group = [];
    }
  }

  if(group.length) groups.push(group);
  return groups;
}
