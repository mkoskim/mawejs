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
// Number formatting
//-----------------------------------------------------------------------------

export const numfmt = {
  group: Intl.NumberFormat(undefined, {useGrouping: true}),
  sign:  Intl.NumberFormat(undefined, {signDisplay: "always"}),
  gsign: Intl.NumberFormat(undefined, {signDisplay: "always", useGrouping: true}),
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
