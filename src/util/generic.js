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

export function isArray(a) {
  return Array.isArray(a)
}

//-----------------------------------------------------------------------------
// Number formatting
//-----------------------------------------------------------------------------

export const numfmt = {
  group: Intl.NumberFormat(undefined, {useGrouping: true}),
  sign:  Intl.NumberFormat(undefined, {signDisplay: "always"}),
  gsign: Intl.NumberFormat(undefined, {signDisplay: "always", useGrouping: true}),
}

export function text2int(text) {
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

export function lines2text(lines, linebreak = "\n") {
  return lines
    .filter(line => line !== undefined)
    .join(linebreak)
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

export function splitByLeadingElem(list, match, options = {}) {
  const {excludeMatch = false} = options

  const groups = [];
  let group = [];
  let started = false;

  for(const elem of list) {
    if(match(elem)) {
      if(started) {
        groups.push(group);
        group = [];
      }
      if(!excludeMatch) group.push(elem)
    }
    else {
      group.push(elem);
    }
    started = true;
  }

  if(started) groups.push(group);
  return groups;
}

//-----------------------------------------------------------------------------
// Split list to groups ending with a specific element
//-----------------------------------------------------------------------------

export function splitByTrailingElem(list, match, options = {}) {
  const {excludeMatch = false} = options

  const groups = [];
  let group = [];

  for(const elem of list) {

    if(match(elem)) {
      if(!excludeMatch) group.push(elem)
      groups.push(group);
      group = [];
    } else {
      group.push(elem);
    }
  }

  if(group.length) groups.push(group);
  return groups;
}
