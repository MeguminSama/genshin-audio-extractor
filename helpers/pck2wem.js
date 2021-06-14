exports.pck2wem = async ({ pckFile, processingDir }) => {
  const path = require("path");
  const util = require("util");
  const exec = util.promisify(require("child_process").execFile);
  const quickBMS = path.resolve(".", "libs", "quickbms.exe");
  const waveScanBMS = path.resolve(".", "libs", "wavescan.bms");
  const inputFile = path.resolve(pckFile);

  await exec(quickBMS, [waveScanBMS, inputFile, processingDir]);
};
