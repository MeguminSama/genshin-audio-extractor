exports.pck2wem = async ({pckFile, processingDir}) => {
  const path = require("path");
  const util = require("util");
  const exec = util.promisify(require("child_process").execFile);
  const quickBMS = path.join(".", "libs", "quickbms.exe");
  const waveScanBMS = path.join(".", "libs", "wavescan.bms");
  const inputFile = path.join(".", "input", pckFile);

  await exec(quickBMS, [waveScanBMS, inputFile, processingDir]);
};
