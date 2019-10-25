import sequencer from 'heartbeat-sequencer';
import Vex from 'vexflow';
import { renderScore, addInteractivity, NoteMapping, SVGElementById, HitAreaListener, HitAreaById } from './create-score';
import { loadJSON, addAssetPack } from './action-utils';

const {
  Renderer,
  Formatter,
} = Vex.Flow;
let song: Heartbeat.Song;

const createSong = async () => {
  await sequencer.ready();
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
  // await addAssetPack(json);
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
  return song;
}


const colorStaveNote = (el: SVGGElement, color: string) => {
  const stems = el.getElementsByClassName('vf-stem');
  const noteheads = el.getElementsByClassName('vf-notehead');
  // console.log(stem, notehead);
  for (let i = 0; i < stems.length; i++) {
    const stem = stems[i];
    if (stem !== null && stem.firstChild !== null) {
      (stem.firstChild as SVGGElement).setAttribute('fill', color);
      (stem.firstChild as SVGGElement).setAttribute('stroke', color);
    }
  }
  for (let i = 0; i < noteheads.length; i++) {
    const notehead = noteheads[i];
    if (notehead !== null && notehead.firstChild !== null) {
      (notehead.firstChild as SVGGElement).setAttribute('fill', color);
      (notehead.firstChild as SVGGElement).setAttribute('stroke', color);
    }
  }
}

const addListeners = (noteMapping: NoteMapping, svgElementById: SVGElementById) => {
  const hitAreas = document.getElementsByClassName('hitarea');
  Array.from(hitAreas).forEach((hit: HTMLDivElement) => {
    hit.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      const note = noteMapping.MIDIToStave[target.id];
      const midiEvent = note.noteOn;
      const noteOn = sequencer.createMidiEvent(0, 144, midiEvent.data1, midiEvent.data2)
      // const instrument = midiEvent.track.instrument;
      // console.log(instrument);
      // instrument.processEvent(noteOn);
      sequencer.processEvent(noteOn, 'TP00-PianoStereo');
      colorStaveNote(note.attrs.el, 'red');
      showToolTip(hit, midiEvent);
    })
    hit.addEventListener('mouseup', (e: MouseEvent) => {
      // const target = e.target as HTMLDivElement;
      // const note = notesById[target.id] as Vex.Flow.Note;
      // const midiEvent = note.getPlayNote().note.noteOff;
      // const noteOff = sequencer.createMidiEvent(10, 128, midiEvent.data1, 0)
      // // console.log('up', noteOff);
      // sequencer.processEvent(noteOff);
      sequencer.stopProcessEvents();
      colorStaveNote(note.attrs.el, 'black');
      hideToolTip(hit);
    });
  }
};

const toolTip = document.getElementById('tooltip');
const showToolTip = (hit: HTMLDivElement, data: any) => {
  if (toolTip !== null) {
    toolTip.style.display = 'block';
    toolTip.style.left = hit.style.left;
    toolTip.style.top = hit.style.top;
    toolTip.innerHTML = data.noteName;
  }
}

const hideToolTip = (hit: HTMLDivElement) => {
  if (toolTip !== null) {
    toolTip.style.display = 'none';
  }
}

const init = async () => {
  const ppq = 960;
  const numerator = 4;
  const denominator = 4;
  const padding = 10;
  const div = document.getElementById('app');
  const divHitArea = document.getElementById('hitareas') as HTMLDivElement;
  const btnPlay = document.getElementById('play') as HTMLButtonElement;
  const btnStop = document.getElementById('stop') as HTMLButtonElement;

  if (div !== null && divHitArea !== null) {
    const song = await createSong();
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    const context = renderer.getContext() as Vex.Flow.SVGContext;
    const formatter = new Formatter();
    let staveNotes: Vex.Flow.StaveNote[];
    let noteMapping: NoteMapping;
    let svgElementById: SVGElementById = {};
    let hitAreaById: HitAreaById = {};

    const render = () => {
      [staveNotes, noteMapping] = renderScore({
        width: window.innerWidth,
        height: window.innerHeight,
        ppq,
        numerator,
        denominator,
        quantizeValue: 16,
        padding,
        renderer,
        formatter,
        context,
        midiNotes: song.notes,
      });
      const offset = context.svg.getBoundingClientRect();
      [svgElementById, hitAreaById] = addInteractivity(staveNotes, divHitArea, offset, {
        onMouseDown: (id: string) => {
          console.log('add 1', id);
        }
      });
      // console.log(svgElementById, staveNotes, noteMapping);
    }

    render();
    // addListeners(noteMapping, svgElementById);
    Object.values(hitAreaById)[0].onclick = (id, div, note) => {
      console.log(id, div, note);
    }
    Object.values(hitAreaById)[1].addEventListener('click', (id, div, note) => {
      console.log(id, div, note);
    });

    song.notes.forEach((n) => {
      song.addEventListener('event', 'type = NOTE_ON', (event) => {
        const noteId = event.midiNote.id;
        const id = `${noteMapping.MIDIToStave[noteId]}`;
        const el = svgElementById[id];
        colorStaveNote(el, 'red');
      });

      song.addEventListener('event', 'type = NOTE_OFF', (event) => {
        const noteId = event.midiNote.id;
        const id = `${noteMapping.MIDIToStave[noteId]}`;
        const el = svgElementById[id];
        colorStaveNote(el, 'black');
      });
    });

    window.addEventListener('resize', render);
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
        song.pause();
      } else {
        song.play();
      }
    });
    btnStop.addEventListener('click', () => { song.stop() });
  }
}

init();