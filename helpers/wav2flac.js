exports.wav2flac = async ({ outputDir, inputDir, createdFile }) => {
  const path = require("path");
  const util = require("util");
  const exec = util.promisify(require("child_process").execFile);
  const ffmpeg = path.join(".", "libs", "ffmpeg.exe");
  const fileNameNoExt = createdFile.substr(0, createdFile.lastIndexOf('.'));
  const pckFileNameNoExt = createdFile.substr(0, createdFile.lastIndexOf('_'));
  const outputFile = path.join(outputDir, fileNameNoExt + ".flac");
  const wavFilePath = path.join(inputDir, fileNameNoExt + ".wav");

  await exec(ffmpeg, [
    "-i",
    wavFilePath,
    "-y",
    "-af",
    "aformat=s16:44100",
    outputFile,
  ]);

  console.log(
    `${pckFileNameNoExt}.pck -> ${createdFile} -> ${fileNameNoExt}.wav -> ${fileNameNoExt
    }.flac`
  );
};
