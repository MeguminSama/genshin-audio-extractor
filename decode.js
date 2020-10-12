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
const { rmraf } = require("./helpers/rmraf");

const libsDir = path.join(".", "libs");
const quickBMS = path.join(libsDir, "quickbms.exe");
const waveScanBMS = path.join(libsDir, "wavescan.bms");
const vgmstream = path.join(libsDir, "vgmstream-cli.exe");
const ffmpeg = path.join(libsDir, "ffmpeg.exe");

const inputDir = path.join(".", "input");
const baseProcessingDir = path.join(".", "processing");
const outputDir = path.join(".", "output");
const wavOutputDir = path.join(outputDir, "WAV");
const flacOutputDir = path.join(outputDir, "FLAC");
const mp3OutputDir = path.join(outputDir, "MP3");

const extraExportArg = process.argv[2] || 0;

const convertWav = async (subWavOutputDir, processingDir, createdFile) => {
  const outputFile = path.join(
    subWavOutputDir,
    createdFile.split(".")[0] + ".wav"
  );

  const createdFilePath = path.join(processingDir, createdFile);
  await exec(vgmstream, ["-o", outputFile, createdFilePath]);
};

const convertFlac = async (subOutputDir, wavDir, createdFile) => {
  const outputFile = path.join(
    subOutputDir,
    createdFile.split(".")[0] + ".flac"
  );

  const wavFilePath = path.join(wavDir, createdFile.split(".")[0] + ".wav");
  await exec(ffmpeg, [
    "-i",
    wavFilePath,
    "-y",
    "-af",
    "aformat=s16:44100",
    outputFile,
  ]);
};

const convertMp3 = async (subOutputDir, wavDir, createdFile) => {
  const outputFile = path.join(
    subOutputDir,
    createdFile.split(".")[0] + ".mp3"
  );

  const wavFilePath = path.join(wavDir, createdFile.split(".")[0] + ".wav");
  await exec(ffmpeg, [
    "-i",
    wavFilePath,
    "-y",
    "-ar",
    "44100",
    "-b:a",
    "320k",
    outputFile,
  ]);
};

const main = async () => {
  const pckFiles = fs
    .readdirSync(inputDir)
    .filter((f) => f.toLowerCase().endsWith(".pck"));

  console.info(`Found ${pckFiles.length} pck files`);

  for (pckFile of pckFiles) {
    const inputFile = path.join(inputDir, pckFile);
    const processingDir = path.join(baseProcessingDir, pckFile.split(".")[0]);

    await mkdirp(processingDir);

    await exec(quickBMS, [waveScanBMS, inputFile, processingDir]);

    const createdFiles = fs.readdirSync(processingDir);

    const subWavOutputDir = path.join(wavOutputDir, pckFile.split(".")[0]);
    const subFlacOutputDir = path.join(flacOutputDir, pckFile.split(".")[0]);
    const subMp3OutputDir = path.join(mp3OutputDir, pckFile.split(".")[0]);

    await mkdirp(subWavOutputDir);

    if (extraExportArg === "flac" || extraExportArg === "flacandmp3") {
      await mkdirp(subFlacOutputDir);
    }

    if (extraExportArg === "mp3" || extraExportArg === "flacandmp3") {
      await mkdirp(subMp3OutputDir);
    }

    for (createdFile of createdFiles) {
      await convertWav(subWavOutputDir, processingDir, createdFile);

      switch (extraExportArg) {
        case "flac":
          await convertFlac(subFlacOutputDir, subWavOutputDir, createdFile);

          console.log(
            `${pckFile} -> ${createdFile} -> ${
              createdFile.split(".")[0]
            }.wav -> ${createdFile.split(".")[0]}.flac`
          );
          break;
        case "mp3":
          await convertMp3(subMp3OutputDir, subWavOutputDir, createdFile);

          console.log(
            `${pckFile} -> ${createdFile} -> ${
              createdFile.split(".")[0]
            }.wav -> ${createdFile.split(".")[0]}.mp3`
          );
          break;
        case "flacandmp3":
          await Promise.all([
            convertFlac(subFlacOutputDir, subWavOutputDir, createdFile),
            convertMp3(subMp3OutputDir, subWavOutputDir, createdFile),
          ]);

          console.log(
            `${pckFile} -> ${createdFile} -> ${
              createdFile.split(".")[0]
            }.wav -> ${createdFile.split(".")[0]}.flac -> ${
              createdFile.split(".")[0]
            }.mp3`
          );
          break;
        default:
          console.log(
            `${pckFile} -> ${createdFile} -> ${createdFile.split(".")[0]}.wav`
          );
          break;
      }
    }
  }

  await rmraf(baseProcessingDir);
};

main();
