
function decodeError({name, message, extra}) {
  const e = new Error(message)
  e.name = name
  Object.assign(e, extra)
  return e
}

export async function ipcCall(channel, cmd, ...args) {
  const {error, result} = await window.ipc.invoke(channel, cmd, ...args);
  if (error) throw decodeError(error);
  return result;
}

