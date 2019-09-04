import 'jzz';
import sequencer from 'heartbeat-sequencer';
import Vex from 'vexflow';
import { addAssetPack, loadJSON, initSequencer } from './action-utils';
import { convertNote } from './note-converter';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

const init1 = async () => {
  await initSequencer();
  const song = sequencer.createSong({});
  const track = sequencer.createTrack('piano');
  const part = sequencer.createPart();
  const srcName = 'TP03-Vibraphone';
  let url = `https://groovy3.heartbeatjs.org/assets/groovy-instruments/mono-mp3-112/${srcName}.mp3.112.json`;
  if (sequencer.browser === 'firefox') {
    // url = `/assets/groovy-instruments/mono-22k-q1/${srcName}.json`;
    url = `https://heartbeatjs.org/groovy-instruments/mono-22k-q1/${srcName}.json`;
  }
  const json = await loadJSON(url);
  await addAssetPack(json);
  const events = [
    sequencer.createMidiEvent(0, 144, 60, 100),
    sequencer.createMidiEvent(960 * 1, 128, 60, 0),

    sequencer.createMidiEvent(960 * 1, 144, 64, 100),
    sequencer.createMidiEvent(960 * 2, 128, 64, 0),

    sequencer.createMidiEvent(960 * 2, 144, 66, 100),
    sequencer.createMidiEvent(960 * 4, 128, 66, 0),
  ];
  part.addEvents(events);
  track.setInstrument(srcName);
  track.addPart(part);
  song.addTrack(track);
  song.update();
  // song.play();
  // console.log(song);
  const notes = song.notes.map(note => convertNote(note, song.ppq));
  return notes;
}

const init2 = (notes: Vex.Flow.StaveNote[]) => {
  const div = document.getElementById('app');

  if (div !== null) {
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(500, 500);
    const context = renderer.getContext();
    const stave = new Stave(10, 40, 400);
    stave.addClef('treble').addTimeSignature('4/4');
    stave.setContext(context).draw();


    // Create a voice in 4 / 4 and add above notes
    const voice = new Voice({ num_beats: 4, beat_value: 4 });
    voice.addTickables(notes);
    // Format and justify the notes to 400 pixels.
    const formatter = new Formatter()
    formatter.joinVoices([voice]).format([voice], 400);
    voice.draw(context, stave);

    const offset = context.svg.getBoundingClientRect();

    const notesById: { [id: string]: any } = notes.reduce((acc, val) => {
      const id: string = val.attrs.id;
      acc[id] = val;
      return acc;
    }, {});

    notes.forEach(note => {
      const bbox = note.attrs.el.getElementsByClassName('vf-notehead')[0].getBBox();
      const hit = document.createElement('div');
      hit.id = note.attrs.id;
      hit.className = 'hitarea';
      hit.style.width = `${bbox.width}px`;
      hit.style.height = `${bbox.height}px`;
      hit.style.left = `${bbox.x + offset.x}px`;
      hit.style.top = `${bbox.y + offset.y}px`;
      document.body.appendChild(hit);
      hit.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLDivElement;
        const note = notesById[target.id] as Vex.Flow.Note;
        const midiEvent = note.getPlayNote().note.noteOn;
        const noteOn = sequencer.createMidiEvent(0, 144, midiEvent.data1, midiEvent.data2)
        sequencer.processEvent(noteOn);
      })
      hit.addEventListener('mouseup', (e: MouseEvent) => {
        // const target = e.target as HTMLDivElement;
        // const note = notesById[target.id] as Vex.Flow.Note;
        // const midiEvent = note.getPlayNote().note.noteOff;
        // const noteOff = sequencer.createMidiEvent(10, 128, midiEvent.data1, 0)
        // // console.log('up', noteOff);
        // sequencer.processEvent(noteOff);
        sequencer.stopProcessEvents();
      })
    });
  }
}


const init = async () => {
  const notes = await init1();
  init2(notes);
  // const instrument = sequencer.getInstrument('TP03-Vibraphone');
  // document.addEventListener('mouseup', () => {
  //   instrument.allNotesOff();
  // })
}

init();
