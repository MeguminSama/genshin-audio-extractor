exports.wav2flac = async ({outputDir, inputDir, createdFile}) => {
  const path = require("path");
  const util = require("util");
  const exec = util.promisify(require("child_process").execFile);
  const ffmpeg = path.join(".", "libs", "ffmpeg.exe");
  const outputFile = path.join(
    outputDir,
    createdFile.split(".")[0] + ".flac"
  );
  const wavFilePath = path.join(inputDir, createdFile.split(".")[0] + ".wav");

  await exec(ffmpeg, [
    "-i",
    wavFilePath,
    "-y",
    "-af",
    "aformat=s16:44100",
    outputFile,
  ]);

  console.log(
    `${createdFile.split("_")[0]}.pck -> ${createdFile} -> ${createdFile.split(".")[0]}.wav -> ${
      createdFile.split(".")[0]
    }.flac`
  );
};
