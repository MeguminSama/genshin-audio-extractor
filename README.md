# Genshin Audio Extractor

## Usage

1. Extract your audio files from the Genshin Impact datafiles.

```
GenshinImpact_Data/StreamingAssets/Audio/GeneratedSoundBanks/Windows
```

Move the .pck files you want to extract into the `input` folder. The files *must* be directly inside the folder - no subdirectories.

2. install dependencies

```bash
npm install
```

3. Run the program

```bash
node decode.js
```

The files in `./input` will be converted to .wav files inside `./output`.

## Options

You can pass an optional argument to export the audio in different formats.

Valid arguments are `flac`, `mp3` and `flacandmp3`

```bash
node decode.js flac
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

- [ ] More?
