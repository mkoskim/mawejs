//*****************************************************************************
//*****************************************************************************
//
// Extract story head info
//
//*****************************************************************************
//*****************************************************************************

export function info(head) {

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
    if(head.nickname) {
      return {
        author: head.nickname,
      }
    }
    return {
      author: head.author,
    }
  }

  return {
    ...getTitle(head),
    ...getAuthor(head),
  }
}
