# Interactive VexFlow score (test #1)

This prototype shows a possible way to add interactivity to a VexFlow score. It uses heartbeat for playing back the score.

- A new MIDI song is created using heartbeat, the song contains only 3 notes.
- The heartbeat notes are used to generate a VexFlow score.
- After the score has been rendered:
  - on top of every stavenote SVG element a hit-area div is rendered.
  - all stavenote SVG elements get connected to their corresponding heartbeat notes.

This way we have interactivity per stavenote; this is used to render a tooltip showing the notename when you click a note in the score.

Also we can highlight the note in the score as soon as heartbeat's playhead reaches that note, and heartbeat plays the note when clicked.

You can test a live version over here:

<https://heartbeatjs.org/vexflow/>


## install & run

```
git clone git@github.com:abudaan/vexflow-test.git
cd vexflow-test
npm i
npm run watch
```
The prototype runs at <http://localhost:3000>