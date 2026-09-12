export function fileOpenDialog(options) {
  return Promise.resolve(options.defaultPath);
}

export function fileSaveDialog(options) {
  return Promise.resolve(options.defaultPath);
}

export function messageBox() {
  return Promise.resolve({ response: 2 });
}

export function confirmUnsavedDlg() {
  return Promise.resolve("cancel");
}
