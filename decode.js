/**
 * @title Genshin Audio Extractor
 * @description Extract .pck files from Genshin Impact
 * @author Rie Takahashi
 * When modifying or redistributing this project, do not modify this notice.
 */

const {Terminal}                            = require('./helpers/Terminal');
const os                                    = require("os");
const fs                                    = require("fs");
const path                                  = require("path");
const mkdirp                                = require("mkdirp");
const {StaticPool}                          = require("node-worker-threads-pool");
const {rmraf}                               = require("./helpers/rmraf");
const {pck2wem, wem2wav, wav2flac, wav2mp3} = require('./helpers/converters');

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

  const debug    = args['--verbose'] != null;
  const terminal = Terminal(debug);

  terminal.info('== Genshin Audio Extractor - Provided by MeguminSama')
  terminal.debug('Verbose mode enabled.');

  const inputFolder  = args['--input'];
  const outputFormat = args['--audio'] ?? 'mp3';

  terminal.debug(`Input Folder: ${inputFolder}`);
  terminal.debug(`Output Format: ${outputFormat}`);

  terminal.info('Listing pck files...')
  const pckFiles = fs.readdirSync(path.resolve(args['--input'])).filter((f) => f.toLowerCase().endsWith(".pck"));
  terminal.info(`Found ${pckFiles.length} pck files`);

  terminal.debug('Creating converters pools...');
  const pck2wemPool  = new StaticPool({size: cpuCount, task: pck2wem});
  const wem2wavPool  = new StaticPool({size: cpuCount, task: wem2wav});
  const wav2flacPool = new StaticPool({size: cpuCount, task: wav2flac});
  const wav2mp3Pool  = new StaticPool({size: cpuCount, task: wav2mp3});

  terminal.info('Starting extraction...')
  await Promise.all(
    pckFiles
      .map((file) => ({filename: file, path: path.join(inputFolder, file)}))
      .map(async (pckFile) => {
        const dirName       = pckFile.filename.substr(0, pckFile.filename.lastIndexOf('.'))
        const processingDir = path.join(".", "processing", dirName);
        await mkdirp(processingDir);

        terminal.info(`Processing ${pckFile.path}`);
        await pck2wemPool.exec({debug, outDir: processingDir, file: pckFile.path});
        terminal.info(`Finished ${pckFile.path}`);

        const subWavOutputDir  = path.join(".", "output", "WAV", dirName);
        const subFlacOutputDir = path.join(".", "output", "FLAC", dirName);
        const subMp3OutputDir  = path.join(".", "output", "MP3", dirName);

        await mkdirp(subWavOutputDir);

        if (outputFormat.includes('flac')) {
          await mkdirp(subFlacOutputDir);
        }

        if (outputFormat.includes('mp3')) {
          await mkdirp(subMp3OutputDir);
        }

        terminal.info('Listing wem files...')
        const createdFiles = fs.readdirSync(processingDir);
        terminal.info(`Found ${createdFiles.length} wem files.`);


        await Promise.all(
          createdFiles.map(async (createdFile) => {
            await wem2wavPool.exec({
              debug,
              outDir: subWavOutputDir,
              srcDir: processingDir,
              file  : createdFile
            });
          })
        );

        switch (args['--audio']) {
          case "flac":
            await Promise.all(
              createdFiles.map(async (createdFile) => {
                await wav2flacPool.exec({
                  debug,
                  outDir: subFlacOutputDir,
                  srcDir: subWavOutputDir,
                  file  : createdFile
                });
              })
            );
            break;
          case "mp3":
            await Promise.all(
              createdFiles.map(async (createdFile) => {
                await wav2mp3Pool.exec({
                  debug,
                  outDir: subMp3OutputDir,
                  srcDir: subWavOutputDir,
                  file  : createdFile
                });
              })
            );
            break;
          case "flacandmp3":
            await Promise.all([
              ...createdFiles.map(async (createdFile) => {
                await wav2flacPool.exec({
                  debug,
                  outDir: subFlacOutputDir,
                  srcDir: subWavOutputDir,
                  file  : createdFile
                });
              }),
              ...createdFiles.map(async (createdFile) => {
                await wav2mp3Pool.exec({
                  debug,
                  outDir: subMp3OutputDir,
                  srcDir: subWavOutputDir,
                  file  : createdFile
                });
              }),
            ]);
            break;
          default:
            break;
        }
      })
  );

  terminal.info('Removing processing folder...')
  await rmraf(path.join(".", "processing"));
  terminal.info('Extraction finished.')
};

main().then(() => {
  process.exit();
}).catch((e) => {
  console.log(e);
  console.error('Something happened during extraction. Use --verbose to display more information during the execution.');
  process.exit();
});
