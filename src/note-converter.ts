import Vex from 'vexflow';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

const mapping: { [id: string]: string } = {
  '1': 'q',
  '2': 'h',
};

const convertNote = (note: Heartbeat.MIDINote, ppq: number): Vex.Flow.StaveNote => {
  const ratio = note.durationTicks / ppq;
  const {
    name,
    octave,
  } = note.note;
  const duration = mapping[ratio.toString()];
  // console.log(name, octave, ratio, duration);
  const sn = new StaveNote({ clef: 'treble', keys: [`${name}/${octave}`], duration });
  sn.setPlayNote({ note });
  return sn;
}

export {
  convertNote,
}