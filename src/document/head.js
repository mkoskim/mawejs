//*****************************************************************************
//*****************************************************************************
//
// Extract story head info
//
//*****************************************************************************
//*****************************************************************************

export function info(head) {
  return {
    ...getTitle(head),
    ...getAuthor(head),
  }
}

export function getHeader(head) {
  const {author, title} = info(head)
  return (author ? `${author}: ` : "") + (title ?? "<New Story>")
}

function getTitle(head) {
  if(head.title) {
    return {
      title: head.title,
      subtitle: head.subtitle,
    }
  }
  return {
    title: head.name,
  }
}

function getAuthor(head) {
  if(head.pseudonym) {
    return {
      author: head.pseudonym,
    }
  }
  return {
    author: head.author,
  }
}

export function storyType(story) {
  switch(story.exports?.type) {
    case "short": return "Short"
    case "long": return "Long"
  }
  return undefined
}

