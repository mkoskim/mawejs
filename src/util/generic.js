
//-----------------------------------------------------------------------------
// Split list to groups starting by a specific element
//-----------------------------------------------------------------------------

export function splitByLeadingElem(list, match) {
  return list.reduce(
    (grouped, elem) => {
      const head = grouped.length > 1 ? grouped.slice(0, -1) : [];
      const tail = grouped.slice(-1).flat();

      //logger.debug(`Grouped: ${JSON.stringify(grouped)}`);
      //logger.debug(`Head: ${JSON.stringify(head)}`);
      //logger.debug(`Tail: ${JSON.stringify(head)}`);

      if (match(elem)) {
        return [...head, tail, [elem]];
      }
      return [...head, tail.concat(elem)];
    },
    [[]]
  )
}

//-----------------------------------------------------------------------------
// Split list to groups starting by a specific element
//-----------------------------------------------------------------------------

export function splitByTrailingElem(list, match) {
  return list.reduce(
    (grouped, elem) => {
      const head = grouped.length > 1 ? grouped.slice(0, -1) : [];
      const tail = grouped.slice(-1).flat();

      //logger.debug(`Grouped: ${JSON.stringify(grouped)}`);
      //logger.debug(`Head: ${JSON.stringify(head)}`);
      //logger.debug(`Tail: ${JSON.stringify(head)}`);

      if (match(elem)) {
        return [...head, tail.concat(elem), []];
      }
      return [...head, tail.concat(elem)];
    },
    []
  )
}
