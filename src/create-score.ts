import Vex from 'vexflow';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

export type RenderScoreArgs = {
  width: number
  height: number
  padding: number
  ppq: number
  numerator: number
  denominator: number
  quantizeValue: number
  context: Vex.Flow.SVGContext
  renderer: Vex.Flow.Renderer
  formatter: Vex.Flow.Formatter
  midiNotes: Heartbeat.MIDINote[]
}

const roundToStep = (number: number, increment: number, offset: number = 0): number => {
  return Math.ceil((number - offset) / increment) * increment + offset;
}

const getDuration = (roundedTicks: number): string => {
  // console.log(roundedTicks);
  switch (roundedTicks) {
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

export type NoteMapping = {
  staveToMIDI: { [id: string]: string }
  MIDIToStave: { [id: string]: string }
}

export type SVGElementById = { [id: string]: SVGGElement }


export const convertMIDINoteToStaveNote = (
  notes: Heartbeat.MIDINote[],
  quantizeValue: number,
  ppq: number,
): [Vex.Flow.StaveNote[], NoteMapping] => {
  const staveNotes: Vex.Flow.StaveNote[] = [];
  const notesMap: NoteMapping = {
    staveToMIDI: {}, MIDIToStave: {}
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
      staveNotes.push(sn);
      notesMap.staveToMIDI[sn.attrs.id] = note.id;
      notesMap.MIDIToStave[note.id] = sn.attrs.id;
    });

  return [staveNotes, notesMap];
}


export const addInteractivity = (
  notes: Vex.Flow.StaveNote[],
  divHitArea: HTMLDivElement,
  offset: { left: number, top: number },
  onMouseDown?: (id: string) => void,
  onMouseUp?: (id: string) => void,
) => {
  while (divHitArea.firstChild) {
    divHitArea.firstChild.remove();
  }
  const svgElementById: SVGElementById = {};
  notes.forEach(note => {
    const bbox = note.attrs.el.getElementsByClassName('vf-notehead')[0].getBBox();
    const id = note.attrs.id;
    let hit = document.getElementById(id);
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

    if (onMouseDown) {
      hit.addEventListener('mousedown', () => onMouseDown(id))
    }

    if (onMouseUp) {
      hit.addEventListener('mouseup', () => onMouseUp(id))
    }

    svgElementById[hit.id] = note.attrs.el as SVGGElement;
  });
  return svgElementById;
}


export const renderScore = ({
  renderer, formatter, width, height, padding, midiNotes,
  quantizeValue, ppq, numerator, denominator, context
}: RenderScoreArgs): [Vex.Flow.StaveNote[], NoteMapping] => {
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

  // const staveNotesById: { [id: string]: Vex.Flow.StaveNote } = staveNotes.reduce((acc: { [id: string]: Vex.Flow.StaveNote }, val) => {
  //   const id: string = val.attrs.id;
  //   acc[id] = val;
  //   return acc;
  // }, {});

  return [staveNotes, notesMap];
}