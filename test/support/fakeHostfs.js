import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

export function createFakeHostfs(root = process.cwd()) {
  return {
    async fstat(fileid) {
      const resolved = resolvePath(root, fileid);
      const stat = await lstat(resolved);

      return {
        id: resolved,
        name: path.basename(resolved),
        hidden: path.basename(resolved).startsWith("."),
        symlink: stat.isSymbolicLink(),
        access: true,
        type: stat.isDirectory() ? "folder" : stat.isFile() ? "file" : undefined,
        size: stat.size,
        modified: stat.mtimeMs,
      };
    },

    async read(fileid, encoding = "utf8") {
      const resolved = resolvePath(root, fileid);
      return readFile(resolved, encoding === null ? undefined : { encoding });
    },
  };
}

function resolvePath(root, fileid) {
  return path.isAbsolute(fileid) ? fileid : path.resolve(root, fileid);
}
