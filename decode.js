/**
 * @title Genshin Audio Extractor
 * @description Extract .pck files from Genshin Impact
 * @author Rie Takahashi
 * When modifying or redistributing this project, do not modify this notice.
 */

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const util = require("util");
const exec = util.promisify(require("child_process").execFile);

const toolsDir = path.join(".", "Tools");
const quickBMS = path.join(toolsDir, "quickbms.exe");
const waveScanBMS = path.join(toolsDir, "wavescan.bms");
const vgmstream = path.join(toolsDir, "vgmstream-cli.exe");

const main = async () => {
  const gameFiles = fs
    .readdirSync("Game Files")
    .filter((f) => f.toLowerCase().endsWith(".pck"));

  const baseProcessingFolder = path.join(".", "Tools", "Decoding");
  console.log(`Found ${gameFiles.length} Game Files`);
  for (gameFile of gameFiles) {
    const inputFolder = path.join(".", "Game Files");
    const inputFile = path.join(inputFolder, gameFile);
    const processingFolder = path.join(
      baseProcessingFolder,
      gameFile.split(".")[0]
    );
    await mkdirp(processingFolder);
    
    const { stdout, stderr } = await exec(quickBMS, [
      waveScanBMS,
      inputFile,
      processingFolder,
    ]);

    const createdFiles = fs.readdirSync(processingFolder);
    const outputFolder = path.join(".", "WAV", gameFile.split(".")[0]);
    await mkdirp(outputFolder);

    for (createdFile of createdFiles) {
      const outputFile = path.join(
        outputFolder,
        createdFile.split(".")[0] + ".wav"
      );

      const createdDirFile = path.join(processingFolder, createdFile);
      await exec(vgmstream, ["-o", outputFile, createdDirFile]);

      console.log(
        `${gameFile} -> ${createdFile} -> ${createdFile.split(".")[0] + ".wav"}`
      );
    }
  }
};

main();
