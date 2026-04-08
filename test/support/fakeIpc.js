export function installFakeIpc(hostfs) {
  globalThis.window = {
    navigator: {
      platform: "Linux x86_64",
    },
    ipc: {
      invoke: async (channel, cmd, ...args) => {
        try {
          if (channel !== "hostfs") {
            throw new Error(`Unsupported IPC channel: ${channel}`);
          }

          if (typeof hostfs[cmd] !== "function") {
            throw new Error(`Unsupported hostfs command: ${cmd}`);
          }

          return { result: await hostfs[cmd](...args) };
        } catch (error) {
          return {
            error: {
              name: error.name,
              message: error.message,
              extra: { ...error },
            },
          };
        }
      },
    },
  };

  globalThis.document = {
    title: "",
    addEventListener() {},
    removeEventListener() {},
    getElementById() {
      return null;
    },
  };
}
