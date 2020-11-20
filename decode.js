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
const { basename } = require("path");

const cpuCount = os.cpus().length;

const main = async () => {
  const args = process.argv.slice(2);
  const argsv = args.join(" ");
  let [input, extra] = [argsv.split("--input ")[1], argsv.split("--audio ")[1]];
  if (!input) return console.error("--input required");
  const inputArg = input.split(" ")[0];
  const extraArg = extra ? extra.split(" ")[0] : extra;
  const pckFiles = fs
    .readdirSync(path.resolve(inputArg))
    .filter((f) => f.toLowerCase().endsWith(".pck"));

  console.info(`Found ${pckFiles.length} pck files`);

  const extraExportArg = extraArg || "";

  const pck2wemPool = new StaticPool({ size: cpuCount, task: pck2wem });
  const wem2wavPool = new StaticPool({ size: cpuCount, task: wem2wav });
  const wav2flacPool = new StaticPool({ size: cpuCount, task: wav2flac });
  const wav2mp3Pool = new StaticPool({ size: cpuCount, task: wav2mp3 });

  await Promise.all(
    pckFiles
      .map((file) => ({ filename: file, path: path.join(inputArg, file) }))
      .map(async (pckFile) => {
        const dirName = pckFile.filename.split(".")[0];
        const processingDir = path.join(".", "processing", dirName);
        await mkdirp(processingDir);
        await pck2wemPool.exec({ pckFile: pckFile.path, processingDir });

        const subWavOutputDir = path.join(".", "output", "WAV", dirName);
        const subFlacOutputDir = path.join(".", "output", "FLAC", dirName);
        const subMp3OutputDir = path.join(".", "output", "MP3", dirName);

        await mkdirp(subWavOutputDir);

        if (extraExportArg === "flac" || extraExportArg === "flacandmp3") {
          await mkdirp(subFlacOutputDir);
        }

        if (extraExportArg === "mp3" || extraExportArg === "flacandmp3") {
          await mkdirp(subMp3OutputDir);
        }

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

        switch (extraExportArg) {
          case "flac":
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

  await rmraf(path.join(".", "processing"));

  process.exit();
};

main();
