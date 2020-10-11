# Genshin Audio Extractor

## Usage

1. Extract your audio files from the Genshin Impact datafiles.

```
GenshinImpact_Data/StreamingAssets/Audio/GeneratedSoundBanks/Windows
```

Move the .pck files you want to extract into the `Game Files` folder. The files *must* be directly inside the folder - no subdirectories.

2. install dependencies

```bash
npm install
```

3. Run the program

```bash
node decode.js
```

The files in `./Game Files` will be converted to .wav files inside `./WAV`.

## Cleanup

Leftover files are placed inside `./Tools/Decoding` - Remember to delete these after you're done, as they use a lot of storage.

### Todo:

- [ ] Clean up dependencies

- [ ] Multi-export support (FLAC, MP3, etc)

- [ ] Automatically remove processed files once complete

- [ ] More?
