const ffmpeg = async (debug, outDir, srcDir, file, format) => {
  const options = {
    flac: (i, o) => ['-i', i, '-y', '-af', 'aformat=s16:44100', o],
    mp3 : (i, o) => ['-i', i, '-y', '-ar', '44100', '-b:a', '320k', 'aformat=s16:44100', o],
  }

  const {Terminal} = require('./helpers/Terminal');
  const terminal   = Terminal(debug);

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program = path.resolve('.', 'libs', 'ffmpeg.exe');
  const name    = path.parse(file).name;
  const source  = path.resolve(srcDir, `${name}.wav`);
  const output  = path.resolve(outDir, `${name}.${format}`);

  terminal.debug(`[WAV -> ${format.toUpperCase()}] Converting ${name}...`);
  await exec(program, options[format](source, output));
  terminal.debug(`[WAV -> ${format.toUpperCase()}] ${name} converted`)
}

exports.pck2wem = async ({debug, outDir, file}) => {

  const {Terminal} = require('./helpers/Terminal');
  const terminal   = Terminal(debug);
  const path       = require('path');
  const util       = require('util');
  const exec       = util.promisify(require('child_process').execFile);

  const program  = path.resolve('.', 'libs', 'quickbms.exe');
  const waveScan = path.resolve('.', 'libs', 'wavescan.bms');
  const input    = path.resolve(file);
  const name     = path.parse(file).name;

  terminal.debug(`[PCK -> WEM] Unpacking ${name}...`);
  await exec(program, [waveScan, input, outDir]);
  terminal.debug(`[PCK -> WEM] ${name} unpacked`);
};

exports.wem2wav = async ({debug, outDir, srcDir, file}) => {

  const {Terminal} = require('./helpers/Terminal');
  const terminal   = Terminal(debug);

  const path = require('path');
  const util = require('util');
  const exec = util.promisify(require('child_process').execFile);

  const program = path.resolve('.', 'libs', 'vgmstream-cli.exe');
  const name    = path.parse(file).name;
  const source  = path.resolve(srcDir, `${name}.wem`);
  const output  = path.resolve(outDir, `${name}.wav`);

  terminal.debug(`[WEM -> WAV] Converting ${name}...`);
  await exec(program, ['-o', output, source]);
  terminal.debug(`[WEM -> WAV] ${name} converted.`)
};

exports.wav2flac = async ({debug, outDir, srcDir, file}) => {
  await ffmpeg(debug, outDir, srcDir, file, 'flac')
}

exports.wav2mp3 = async ({debug, outDir, srcDir, file}) => {
  await ffmpeg(debug, outDir, srcDir, file, 'mp3')
}



