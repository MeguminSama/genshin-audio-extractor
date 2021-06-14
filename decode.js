/**
 * @title Genshin Audio Extractor
 * @description Extract .pck files from Genshin Impact
 * @author Rie Takahashi
 * When modifying or redistributing this project, do not modify this notice.
 */

const os = require("os");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const { StaticPool } = require("node-worker-threads-pool");
const { rmraf } = require("./helpers/rmraf");
const { pck2wem } = require("./helpers/pck2wem");
const { wem2wav } = require("./helpers/wem2wav");
const { wav2flac } = require("./helpers/wav2flac");
const { wav2mp3 } = require("./helpers/wav2mp3");
const arg = require("arg");

const cpuCount = os.cpus().length;

const main = async () => {
  const args = arg({
    // Types
    "--input": String,
    "--audio": String,
    "--verbose": arg.COUNT,

    // Aliases
    "-i": "--input",
    "-a": "--audio",
    "-v": "--verbose",
  });
  if (args['--verbose']) console.log('Verbose logging enabled');
  const pckFiles = fs
    .readdirSync(path.resolve(args['--input']))
    .filter((f) => f.toLowerCase().endsWith(".pck"));

  console.info(`Found ${pckFiles.length} pck files`);
  if (args['--verbose']) console.log('Input: ' + args['--input'], 'Audio: ' + args['--audio']);

  const pck2wemPool = new StaticPool({ size: cpuCount, task: pck2wem });
  const wem2wavPool = new StaticPool({ size: cpuCount, task: wem2wav });
  const wav2flacPool = new StaticPool({ size: cpuCount, task: wav2flac });
  const wav2mp3Pool = new StaticPool({ size: cpuCount, task: wav2mp3 });
  await Promise.all(
    pckFiles
      .map((file) => ({ filename: file, path: path.join(args['--input'], file) }))
      .map(async (pckFile) => {
        const dirName = pckFile.filename.substr(0, pckFile.filename.lastIndexOf('.'))
        const processingDir = path.join(".", "processing", dirName);
        await mkdirp(processingDir);
        
        if (args['--verbose']) console.log('Processing: ' + pckFile.path);
        await pck2wemPool.exec({ pckFile: pckFile.path, processingDir });
        if (args['--verbose']) console.log('Finished: ' + pckFile.path);

        const subWavOutputDir = path.join(".", "output", "WAV", dirName);
        const subFlacOutputDir = path.join(".", "output", "FLAC", dirName);
        const subMp3OutputDir = path.join(".", "output", "MP3", dirName);
        const subOggOutputDir = path.join(".", "output", "OGG", dirName);

        await mkdirp(subWavOutputDir);

        if (!["mp3", "flac", "ogg", "all"].includes(args['--audio']))
          console.log(`'${args['--audio']}' is not a valid audio export option, ignoring`)

        const createdFiles = fs.readdirSync(processingDir);

        await Promise.all(
          createdFiles.map(async (createdFile) => {
            await wem2wavPool.exec({
              outputDir: subWavOutputDir,
              createdFile,
              processingDir,
            });
          })
        );

        switch (args['--audio']) {
          case "flac":
            await mkdirp(subFlacOutputDir);
            await Promise.all(
              createdFiles.map(async (createdFile) => {
                await wav2flacPool.exec({
                  inputDir: subWavOutputDir,
                  outputDir: subFlacOutputDir,
                  createdFile,
                });
              })
            );
            break;
          case "mp3":
            await mkdirp(subMp3OutputDir);
            await Promise.all(
              createdFiles.map(async (createdFile) => {
                await wav2mp3Pool.exec({
                  inputDir: subWavOutputDir,
                  outputDir: subMp3OutputDir,
                  createdFile,
                });
              })
            );
            break;
          case "flacandmp3":
            await Promise.all([
              ...createdFiles.map(async (createdFile) => {
                await wav2flacPool.exec({
                  inputDir: subWavOutputDir,
                  outputDir: subFlacOutputDir,
                  createdFile,
                });
              }),
              ...createdFiles.map(async (createdFile) => {
                await wav2mp3Pool.exec({
                  inputDir: subWavOutputDir,
                  outputDir: subMp3OutputDir,
                  createdFile,
                });
              }),
            ]);
            break;
          default:
            break;
        }
      })
  );

  if (args['--verbose']) console.log('Removing processing folder');
  await rmraf(path.join(".", "processing"));

  process.exit();
};

main();
