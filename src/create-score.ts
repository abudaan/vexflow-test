import Vex from 'vexflow';
import { RenderScoreArgs, NoteMapping, SVGElementById, HitAreaById } from './types';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

const roundToStep = (number: number, increment: number, offset: number = 0): number => {
  return Math.ceil((number - offset) / increment) * increment + offset;
}

const getDuration = (roundedTicks: number): string => {
  // console.log(roundedTicks);
  switch (roundedTicks) {
    case 0.0625:
      return '64';
    case 0.09375:
      return '64d';
    case 0.125:
      return '32';
    case 0.1875:
      return '32d';
    case 0.25:
      return '16';
    case 0.375:
      return '16d';
    case 0.5:
      return '8';
    case 0.75:
      return '8d';
    case 1:
      return 'q';
    case 1.5:
      return 'qd';
    case 2:
      return 'h';
    case 3:
      return 'hd';
    case 4:
      return 'w';
    case 6:
      return 'wd';
    default:
      return 'q';
  }
};

export const convertMIDINoteToStaveNote = (
  notes: Heartbeat.MIDINote[],
  quantizeValue: number,
  ppq: number,
): [Vex.Flow.StaveNote[], NoteMapping] => {
  const staveNotes: Vex.Flow.StaveNote[] = [];
  const notesMap: NoteMapping = {
    midiNoteByStaveNoteId: {}, staveNoteByMIDINoteId: {}
  };
  notes
    .filter(note => isNaN(note.durationTicks) === false)
    .forEach(note => {
      const {
        name,
        octave,
      } = note.note;
      const ticks = roundToStep(note.ticks, quantizeValue);
      const durationTicks = roundToStep(note.durationTicks, quantizeValue);
      const duration = getDuration(durationTicks / ppq);
      // @todo: check for rests, if current ticks value not equal to previous tick plus duration then rest
      const sn = new StaveNote({ clef: 'treble', keys: [`${name}/${octave}`], duration });
      if (duration.indexOf('d') !== -1) {
        sn.addDot(0);
      }
      sn.setPlayNote(note);
      staveNotes.push(sn);
      notesMap.midiNoteByStaveNoteId[sn.attrs.id] = note;
      notesMap.staveNoteByMIDINoteId[note.id] = sn;
    });

  return [staveNotes, notesMap];
}

// add a hitarea for every stavenote -> run this after the score has been rendered!
export const addHitAreas = (
  notes: Vex.Flow.StaveNote[],
  divHitArea: HTMLDivElement,
  offset: { left: number, top: number },
): [SVGElementById, HitAreaById] => {
  while (divHitArea.firstChild) {
    divHitArea.firstChild.remove();
  }
  const svgElementById: SVGElementById = {};
  const hitAreaById: HitAreaById = {};
  notes.forEach(note => {
    const bbox = note.attrs.el.getElementsByClassName('vf-notehead')[0].getBBox();
    const id = note.attrs.id;
    let hit: HTMLDivElement | null = document.getElementById(id) as HTMLDivElement;
    if (hit === null) {
      hit = document.createElement('div');
      divHitArea.appendChild(hit);
      hit.id = note.attrs.id;
      hit.className = 'hitarea';
    }
    hit.style.width = `${bbox.width}px`;
    hit.style.height = `${bbox.height}px`;
    hit.style.left = `${bbox.x + offset.left}px`;
    hit.style.top = `${bbox.y + offset.top}px`;

    svgElementById[hit.id] = note.attrs.el as SVGGElement;
    hitAreaById[hit.id] = hit;
  });
  return [svgElementById, hitAreaById];
}

let renderer: Vex.Flow.Renderer;
let context: Vex.Flow.SVGContext;
let formatter: Vex.Flow.Formatter;
const initScore = (div: HTMLDivElement) => {
  if (!renderer) {
    renderer = new Renderer(div, Renderer.Backends.SVG);
    context = renderer.getContext() as Vex.Flow.SVGContext;
    formatter = new Formatter();
  }
  return {
    renderer,
    formatter,
    context
  }
}

// render the VexFlow score using notes from the heartbeat song
export const renderScore = ({
  width, height, padding, midiNotes,
  quantizeValue, ppq, numerator, denominator, div,
}: RenderScoreArgs): [Vex.Flow.StaveNote[], NoteMapping, Vex.Flow.SVGContext] => {
  const { renderer, formatter, context } = initScore(div);
  renderer.resize(width, height);
  context.clear();
  const stave = new Stave(0, 40, width - (padding * 2));
  stave.addClef('treble').addTimeSignature(`${numerator}/${denominator}`);
  stave.setContext(context).draw();
  // Create a voice in 4 / 4 and add above notes
  // @todo: calculate num_beats based on the provided MIDINotes
  const voice = new Voice({ num_beats: 4, beat_value: denominator });
  const [staveNotes, notesMap] = convertMIDINoteToStaveNote(midiNotes, quantizeValue, ppq)
  voice.addTickables(staveNotes);
  // Format and justify the notes to 400 pixels.
  formatter.joinVoices([voice]).format([voice], width - (padding * 2));
  voice.draw(context, stave);

  return [staveNotes, notesMap, context];
}