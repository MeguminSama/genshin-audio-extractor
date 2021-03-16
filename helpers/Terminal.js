exports.Terminal = (debugEnabled) => {
  return {
    error: (message) => {
      console.log("\x1b[31m  ERR: " + message)
    },
    warn : (message) => {
      console.log("\x1b[33m WARN: " + message)
    },
    info : (message) => {
      console.log("\x1b[36m INFO: " + message)
    },
    debug: debugEnabled ? (message) => {
      console.log("\x1b[35mDEBUG: " + message)
    } : () => {
    }
  }
}