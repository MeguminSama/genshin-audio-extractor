exports.wav2mp3 = async ({ outputDir, inputDir, createdFile }) => {
  const path = require("path");
  const util = require("util");
  const exec = util.promisify(require("child_process").execFile);
  const ffmpeg = path.join(".", "libs", "ffmpeg.exe");
  const fileNameNoExt = createdFile.substr(0, createdFile.lastIndexOf('.'));
  const pckFileNameNoExt = createdFile.substr(0, createdFile.lastIndexOf('_'));
  const outputFile = path.join(outputDir, fileNameNoExt + ".mp3");
  const wavFilePath = path.join(inputDir, fileNameNoExt + ".wav");

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

  console.log(
    `${pckFileNameNoExt}.pck -> ${createdFile} -> ${fileNameNoExt}.wav -> ${fileNameNoExt
    }.mp3`
  );
};
