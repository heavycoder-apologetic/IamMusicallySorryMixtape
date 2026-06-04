# /public/audio

Drop placeholder or licensed `.mp3` files here, matching the filenames
referenced in `src/data/songs.ts`:

- pehla-nasha.mp3
- tujhe-dekha.mp3
- keh-do.mp3
- ae-kash.mp3
- bahut-pyar.mp3
- dil-to-pagal.mp3
- ho-gaya.mp3
- chura-ke.mp3
- mera-dil.mp3
- tum-mile.mp3

Missing files are handled gracefully — the UI will show the song as
"selected but paused" because the underlying `<audio>` element fails
to load. For quick testing, use any royalty-free short MP3 and rename it
to one of the above.
