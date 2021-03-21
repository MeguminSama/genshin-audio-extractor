exports.pck2wem = async ({outDir, file}) => {

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program  = path.resolve('.', 'libs', 'quickbms.exe');
  const waveScan = path.resolve('.', 'libs', 'wavescan.bms');
  const input    = path.resolve(file);

  await exec(program, [waveScan, input, outDir]);
};

exports.wem2wav = async ({outDir, srcDir, file}) => {

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program = path.resolve('.', 'libs', 'vgmstream-cli.exe');
  const name    = path.parse(file).name;
  const source  = path.resolve(srcDir, `${name}.wem`);
  const output  = path.resolve(outDir, `${name}.wav`);

  await exec(program, ['-o', output, source]);
};

exports.wav2flac = async ({outDir, srcDir, file}) => {

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program = path.resolve('.', 'libs', 'ffmpeg.exe');
  const name    = path.parse(file).name;
  const source  = path.resolve(srcDir, `${name}.wav`);
  const output  = path.resolve(outDir, `${name}.flac`);

  await exec(program, ['-i', source, '-y', '-af', 'aformat=s16:44100', output]);
}

exports.wav2mp3 = async ({outDir, srcDir, file}) => {

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program = path.resolve('.', 'libs', 'ffmpeg.exe');
  const name    = path.parse(file).name;
  const source  = path.resolve(srcDir, `${name}.wav`);
  const output  = path.resolve(outDir, `${name}.mp3`);

  await exec(program, ['-i', source, '-y', '-ar', '44100', '-b:a', '320k', output]);
}



