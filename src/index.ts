import { from, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, reduce, groupBy, toArray } from 'rxjs/operators';

import Vex from 'vexflow';
import { createSong } from './create-song';
import { convertToVexFlow } from './note-converter';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

<<<<<<< HEAD
=======
const song;

const init1 = async () => {
  const btnPlay = document.getElementById('play');
  const btnStop = document.getElementById('stop');
  btnPlay.disabled = true;
  btnStop.disabled = true;

  await initSequencer();
  song = sequencer.createSong({ bars: 1 });
  const track = sequencer.createTrack('piano');
  const part = sequencer.createPart();
  // const srcName = 'TP03-Vibraphone';
  const srcName = 'TP00-PianoStereo';
  // let url = `https://groovy3.heartbeatjs.org/assets/groovy-instruments/mono-mp3-112/${srcName}.mp3.112.json`;
  let url = `assets/${srcName}.mp3.json`;
  if (sequencer.browser === 'firefox') {
    // url = `/assets/groovy-instruments/mono-22k-q1/${srcName}.json`;
    // url = `https://heartbeatjs.org/groovy-instruments/mono-22k-q1/${srcName}.json`;
    url = `assets/${srcName}.ogg.json`;
  }
  const json = await loadJSON(url);
  await addAssetPack(json);
  const events = [
    sequencer.createMidiEvent(0, 144, 60, 100),
    sequencer.createMidiEvent(960 * 1, 128, 60, 0),

    sequencer.createMidiEvent(960 * 1, 144, 64, 100),
    sequencer.createMidiEvent(960 * 2, 128, 64, 0),

    sequencer.createMidiEvent(960 * 2, 144, 67, 100),
    sequencer.createMidiEvent(960 * 4, 128, 67, 0),
  ];
  part.addEvents(events);
  track.setInstrument(srcName);
  track.addPart(part);
  song.addTrack(track);
  song.update();
  song.addEventListener('stop', () => {
    btnPlay.innerHTML = 'play';
  });
  song.addEventListener('play', () => {
    btnPlay.innerHTML = 'pause';
  });
  song.addEventListener('end', () => {
    btnPlay.innerHTML = 'play';
  });

  btnPlay.disabled = false;
  btnStop.disabled = false;

  btnPlay.addEventListener('click', () => {
    if (song.playing) {
      // btnPlay.innerHTML = 'play';
      song.pause();
    } else {
      // btnPlay.innerHTML = 'pause';
      song.play();
    }
  });
  btnStop.addEventListener('click', () => { song.stop() });

  // song.play();
  // console.log(song);
  const notes = song.notes.map(note => convertNote(note, song.ppq));
  return notes;
}

>>>>>>> 16b6c40fdb4bafc4ee1aa49dae005f31edda1265
type TypeArgs = {
  width: number
  height: number
  renderer: Vex.Flow.Renderer
  formatter: Vex.Flow.Formatter
  context: Vex.Flow.SVGContext
  notes: Vex.Flow.StaveNote[]
  divHitArea: HTMLDivElement
}

const padding = 10;
const renderScore = ({ width, height, renderer, formatter, context, notes, divHitArea }: TypeArgs) => {
  renderer.resize(width, height);
  context.clear();
  const stave = new Stave(0, 40, width - (padding * 2));
  stave.addClef('treble').addTimeSignature('4/4');
  stave.setContext(context).draw();
  // Create a voice in 4 / 4 and add above notes
  const voice = new Voice({ num_beats: 8, beat_value: 4 });
  voice.addTickables(notes);
  // Format and justify the notes to 400 pixels.
  formatter.joinVoices([voice]).format([voice], width - (padding * 2));
  voice.draw(context, stave);

  const notesById: { [id: string]: any } = notes.reduce((acc, val) => {
    const id: string = val.attrs.id;
    acc[id] = val;
    return acc;
  }, {});

  // Array.from(divHitArea.children).forEach(c => {
  //   // console.log(c);
  //   divHitArea.removeChild(c);
  // })

  const offset = context.svg.getBoundingClientRect();

  // notes.forEach(note => {
  //   const bbox = note.attrs.el.getElementsByClassName('vf-notehead')[0].getBBox();
  //   const id = note.attrs.id;
  //   let hit = document.getElementById(id);
  //   if (hit === null) {
  //     hit = document.createElement('div');
  //     divHitArea.appendChild(hit);
  //     hit.id = note.attrs.id;
  //     hit.className = 'hitarea';
  //     hit.addEventListener('mousedown', (e: MouseEvent) => {
  //       const target = e.target as HTMLDivElement;
  //       const note = notesById[target.id] as Vex.Flow.Note;
  //       const midiEvent = note.getPlayNote().note.noteOn;
  //       const noteOn = sequencer.createMidiEvent(0, 144, midiEvent.data1, midiEvent.data2)
  //       sequencer.processEvent(noteOn);
  //     })
  //     hit.addEventListener('mouseup', (e: MouseEvent) => {
  //       // const target = e.target as HTMLDivElement;
  //       // const note = notesById[target.id] as Vex.Flow.Note;
  //       // const midiEvent = note.getPlayNote().note.noteOff;
  //       // const noteOff = sequencer.createMidiEvent(10, 128, midiEvent.data1, 0)
  //       // // console.log('up', noteOff);
  //       // sequencer.processEvent(noteOff);
  //       sequencer.stopProcessEvents();
  //     })
  //   }
  //   hit.style.width = `${bbox.width}px`;
  //   hit.style.height = `${bbox.height}px`;
  //   hit.style.left = `${bbox.x + offset.left}px`;
  //   hit.style.top = `${bbox.y + offset.top}px`;
  // });

}

const toolTip = document.getElementById('tooltip');
const showToolTip = (hit, data) => {
  toolTip.style.display = 'block';
  toolTip.style.left = hit.style.left;
  toolTip.style.top = hit.style.top;
  toolTip.innerHTML = data.noteName;
}
const hideToolTip = (hit) => {
  toolTip.style.display = 'none';


}

const init2 = (notes: [Vex.Flow.StaveNote, Heartbeat.MIDINote][]) => {
  const div = document.getElementById('app');
  const divHitArea = document.getElementById('hitareas') as HTMLDivElement;

  if (div !== null && divHitArea !== null) {
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    const context = renderer.getContext() as Vex.Flow.SVGContext;
    const formatter = new Formatter();
    const render = () => {
      renderScore({
        width: window.innerWidth,
        height: window.innerHeight,
        renderer,
        formatter,
        context,
        notes: notes.map(n => n[0]),
        divHitArea,
      });
    }
    window.addEventListener('resize', render);
    render();
  }
}

const colorStaveNote = (el, color) => {
  el.firstChild.firstChild.firstChild.setAttribute('stroke', color);
  el.firstChild.firstChild.nextSibling.firstChild.setAttribute('stroke', color);
  el.firstChild.firstChild.nextSibling.firstChild.setAttribute('fill', color);
}

const init = async () => {
  const song = await createSong();
  const div = document.getElementById('app');
  const divHitArea = document.getElementById('hitareas') as HTMLDivElement;

  if (div !== null && divHitArea !== null) {
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(1000, 1000);
    const context = renderer.getContext() as Vex.Flow.SVGContext;
    const formatter = new Formatter()
    const bars = await convertToVexFlow(song).toPromise();

    const width = 200;
    let y = 40;
    bars.forEach((notes: [Heartbeat.MIDINote, []][], index: number) => {
      // console.log('NOTES', index, notes);
      if (index < 2) {
        const alternate = index % 4;
        let x = 0;
        let stave;
        if (alternate === 0) {
          if (index !== 0) {
            y += 80;
          }
          stave = new Stave(x, y, width + 50);
          stave.addClef('treble').addTimeSignature('4/4');
          stave.setContext(context).draw();
        } else {
          x = 50 + (alternate * width);
          stave = new Stave(x, y, width);
          stave.setContext(context).draw();
        }
        // console.log(index, alternate, y);
        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        // const staveNoteData = notes.map(([midiNote, data]) => data);
        const staveNotes = [];
        notes.forEach((data, i) => {
          // console.log(data);
          const keys: string[] = [];
          data.forEach((d, j) => {
            // console.log(i, j, d);
            keys.push(d[1][2]);
          })
          const duration = data[0][1][0];
          const addDot = data[0][1][1];
          console.log(keys, duration, addDot);
          // const sn = new StaveNote({ clef: 'treble', keys, duration });
          // console.log(duration);
          const sn = new StaveNote({ clef: 'treble', keys, duration });
          if (addDot) {
            sn.addDot(0);
          }
          // if (i < 8) {
          staveNotes.push(sn);
          // }
        });
        console.log(staveNotes);
        voice.addTickables(staveNotes);
        formatter.joinVoices([voice]).format([voice], width);
        voice.draw(context, stave);
      }
    });
  }
  // song.play();
  // const notes = await init1();
  // init2(notes);
  // const instrument = sequencer.getInstrument('TP03-Vibraphone');
  // document.addEventListener('mouseup', () => {
  //   instrument.allNotesOff();
  // })
}

init();
