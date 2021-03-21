exports.FileProcessor = class {

  constructor(path, file, audio, poolSize) {

    this.node = {};

    const {StaticPool}  = require("node-worker-threads-pool");
    const {Progression} = require('./Progression');

    this.node.path       = require('path');
    this.node.util       = require('util');
    this.node.exec       = this.node.util.promisify(require('child_process').execFile);
    this.node.mkdirp     = require('mkdirp');
    this.node.fs         = require('fs');
    this.node.converters = require('./converters');
    this.node.StaticPool = StaticPool;

    this.fileCount     = 1;
    this.fileProcessed = 0;

    this.path     = path;
    this.file     = file;
    this.name     = this.node.path.parse(this.file).name;
    this.audio    = audio;
    this.poolSize = poolSize;


    this.progress = new Progression('  File', 4);
    this.progress.addStep('Extracting PCK');
    this.progress.addStep('Converting WEM to WAV');
    switch (this.audio) {
      case 'mp3':
        this.progress.addStep('Converting WAV to MP3');
        break;
      case 'flac':
        this.progress.addStep('Converting WAV to FLAC');
        break;
      case 'flacandmp3':
        this.progress.addStep('Converting WAV to MP3');
        this.progress.addStep('Converting WAV to FLAC');
        break;
    }
    this.progress.setProgress(null);


    this.processingDirectory = this.node.path.join('.', 'processing', this.name);
    this.wavOutputDirectory  = this.node.path.join('.', 'output', 'WAV', this.processingDirectory);
    this.mp3OutputDirectory  = this.node.path.join('.', 'output', 'MP3', this.processingDirectory);
    this.flacOutputDirectory = this.node.path.join('.', 'output', 'FLAC', this.processingDirectory);
  }

  /**
   * Execute this FileProcessor and run every needed conversion.
   *
   * @returns {Promise<void>}
   */
  async execute() {
    await this.createFolders();
    this.progress.nextStep();
    await this.toWem();
    this.fileProcessed++;
    this.progress.setProgress(this.fileProcessed / this.fileCount);

    this.progress.nextStep();
    await this.toWav();

    switch (this.audio) {
      case 'mp3':
        this.progress.nextStep();
        await this.toMp3();
        break;
      case 'flac':
        this.progress.nextStep();
        await this.toFlac();
        break;
      case 'flacandmp3':
        this.progress.nextStep();
        await this.toMp3();
        this.progress.nextStep();
        await this.toFlac();
        break;
    }

    this.progress.nextStep();
    this.progress.setProgress(1);
  }

  /**
   * Create, if necessary, each output folders.
   *
   * @returns {Promise<void>}
   */
  async createFolders() {
    await this.node.mkdirp(this.processingDirectory);
    await this.node.mkdirp(this.wavOutputDirectory);

    switch (this.audio) {
      case 'mp3':
        await this.node.mkdirp(this.mp3OutputDirectory);
        break;
      case 'flac':
        await this.node.mkdirp(this.flacOutputDirectory);
        break;
      case 'flacandmp3':
        await this.node.mkdirp(this.mp3OutputDirectory);
        await this.node.mkdirp(this.flacOutputDirectory);
        break;
    }
  }

  /**
   * Unpack the PCK file and return the generated WEM files.
   *
   * @returns {Promise<String[]>}
   */
  async toWem() {
    await this.node.converters.pck2wem({
      outDir: this.processingDirectory,
      file  : this.path
    });

    this.files = this.node.fs.readdirSync(this.processingDirectory);
    switch (this.audio) {
      case 'mp3':
      case 'flac':
        this.fileCount += (this.files.length * 2);
        break;
      case 'flacandmp3':
        this.fileCount += (this.files.length * 3);
        break;
      default:
        this.fileCount += this.files.length;
    }
  }

  /**
   * Convert all WEM files to WAV.
   *
   * @returns {Promise<void>}
   */
  async toWav() {

    const pool = new this.node.StaticPool({
      size: this.poolSize,
      task: this.node.converters.wem2wav
    })

    await Promise.all(this.files.map(async (file) => {
      await pool.exec({
        outDir: this.wavOutputDirectory,
        srcDir: this.processingDirectory,
        file
      }).then(() => {
        this.fileProcessed++;
        this.progress.setProgress(this.fileProcessed / this.fileCount);
        return Promise.resolve();
      })
    }))
  }

  /**
   * Convert all WAV files to FLAC.
   *
   * @returns {Promise<void>}
   */
  async toFlac() {

    const pool = new this.node.StaticPool({
      size: this.poolSize,
      task: this.node.converters.wav2flac
    });

    await Promise.all(this.files.map(async (file) => {
      await pool.exec({
        outDir: this.flacOutputDirectory,
        srcDir: this.wavOutputDirectory,
        file
      }).then(() => {
        this.fileProcessed++;
        this.progress.setProgress(this.fileProcessed / this.fileCount);
        return Promise.resolve();
      })
    }));
  }

  /**
   * Convert all WAV files to MP3.
   *
   * @returns {Promise<void>}
   */
  async toMp3() {

    const pool = new this.node.StaticPool({
      size: this.poolSize,
      task: this.node.converters.wav2mp3
    });

    await Promise.all(this.files.map(async (file) => {
      await pool.exec({
        outDir: this.mp3OutputDirectory,
        srcDir: this.wavOutputDirectory,
        file
      }).then(() => {
        this.fileProcessed++;
        this.progress.setProgress(this.fileProcessed / this.fileCount);
        return Promise.resolve();
      })
    }));
  }

}