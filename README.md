# Genshin Audio Extractor

## Usage

1. Extract your audio files from the Genshin Impact datafiles.

```
GenshinImpact_Data/StreamingAssets/Audio/GeneratedSoundBanks/Windows
```

Move the .pck files you want to extract into a folder. The files *must* be directly inside the folder - no subdirectories.

2. install dependencies

```bash
npm install
```

3. Run the program

```bash
node decode.js --input <your specified input>
```

The files in `<your specified input>` will be converted to .wav files inside `./output`.

## Options

You can pass an optional argument to export the audio in different formats.

Valid arguments are `flac`, `mp3` and `flacandmp3`

```bash
node decode.js --input flac --audio flac
```

Encoding details

```
flac: lossless, 16bit, 44100 sample rate
mp3: 320kbit/s, 44100 sample rate
```

### Todo:

- [ ] Clean up dependencies

- [ ] Cross-Platform (Win, Linux, OSX)

- [x] Multi-export support (FLAC, MP3, etc)

- [x] Automatically remove processed files once complete

- [x] Multithreading

- [ ] More?


# Fork Update Note

The main goal of this branch on the fork is to add some progress bar while processing files. Some refactor has also been done while doing so.

### 🟢 Added terminal-kit

This has been install to add 2 progress bars to the program: One for the global processing of the input folder, and another one to display the progression + step on the file conversion.

### 🟢 Grouped converters all together

All converters has been grouped in the same file and refactored to have a same arguments order and uses the same code to generate filename.

### 🟠 Removed the pck2wem pool executor

This will be surely added back in future commit as I was mainly testing the behavior of the progress bars with StaticPools


## TODO

- [ ] Add back the StaticPool for PCK 2 WEM converter (and the progressbar along with it).
- [ ] Doing better JSDoc.
