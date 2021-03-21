/**
 * @title Genshin Audio Extractor
 * @description Extract .pck files from Genshin Impact
 * @author Rie Takahashi
 * When modifying or redistributing this project, do not modify this notice.
 */

const {FileProcessor} = require('./helpers/FileProcessor');
const os              = require("os");
const fs              = require("fs");
const path            = require("path");
const {rmraf}         = require("./helpers/rmraf");
const {Progression}   = require('./helpers/Progression');
const term            = require('terminal-kit').terminal;

const arg      = require("arg");
const cpuCount = os.cpus().length;


const main = async () => {
  const args = arg({
    // Types
    "--input"  : String,
    "--audio"  : arg.flag((val) => ["flac", "mp3", "flacandmp3"].includes(val) ? val : null),
    "--verbose": arg.COUNT,

    // Aliases
    "-i": "--input",
    "-a": "--audio",
    "-v": "--verbose",
  });

  const inputFolder  = path.resolve(args['--input']);
  const outputFormat = args['--audio'];

  term.clear();

  term.bold(' Input ');
  term.styleReset();
  term.yellow(inputFolder);
  term.styleReset();

  term.bold('\nFormat ');
  term.styleReset();
  term.yellow(outputFormat ?? 'wav');
  term.styleReset();

  const progress = new Progression(' Total', 3);
  progress.setProgress(0);


  const files = fs.readdirSync(inputFolder).filter((f) => f.toLowerCase().endsWith(".pck"));


  const processors = files
    .map((file) => ({
      filename: file,
      path    : path.join(inputFolder, file)
    }))
    .map((pck) => {
      progress.addStep(pck.filename)
      return new FileProcessor(pck.path, pck.filename, outputFormat, cpuCount);
    });

  for (let i = 0; i < processors.length; i++) {
    const proc = processors[i];
    progress.nextStep();
    await proc.execute();
    progress.setProgress(i / processors.length);
  }

  progress.nextStep();
  progress.setProgress(1);

  await rmraf(path.join(".", "processing"));
};

main().then(() => {
  process.exit();
}).catch((e) => {
  console.log(e);
  console.error('Something happened during extraction.');
  process.exit();
});
