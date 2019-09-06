import { from, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, reduce, groupBy, toArray } from 'rxjs/operators';
import { curry } from 'ramda';


import Vex from 'vexflow';
const {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} = Vex.Flow;

const getDuration = (roundedTicks: number): [string, boolean] => {
  switch (roundedTicks) {
    case 0.5:
      return ['8', false];
    case 0.75:
      return ['8', true];
    case 1:
      return ['q', false];
    case 1.5:
      return ['q', true];
    default:
      return ['q', false];
  }
};

const round = (float: number): number => {
  const r = Math.round(float * 10) / 10;
  return r;
}

const convertNote = (ppq: number, note: Heartbeat.MIDINote): [Heartbeat.MIDINote, Vex.Flow.StaveNote] => {
  // console.log(note);
  const ratio = round(note.durationTicks / ppq);
  const {
    name,
    octave,
  } = note.note;
  const duration = getDuration(ratio);
  // console.log(note.noteOn, name, octave, ratio, duration);
  const sn = new StaveNote({ clef: 'treble', keys: [`${name}/${octave}`], duration: duration[0] });
  if (duration[1]) {
    sn.addDot(0);
  }
  sn.setPlayNote({ noteId: note.id });
  return [note, sn];
}

const convertToVexFlow = (song: Heartbeat.Song): Observable => {
  const notes = song.notes;
  const convert = curry<(ppq: number, note: Heartbeat.MIDINote) => [Heartbeat.MIDINote, Vex.Flow.StaveNote]>(convertNote)(song.ppq);
  return from(notes)
    .pipe(
      map(convert),
      groupBy(([midiNote, vexFlowNote]) => { return midiNote.noteOn.bar; }),
      mergeMap((group) => group.pipe(toArray())),
      // tap(console.log),
      reduce((acc: [Heartbeat.MIDINote, Vex.Flow.StaveNote][][], val: [Heartbeat.MIDINote, Vex.Flow.StaveNote][]) => {
        acc.push(val);
        return acc;
      }, [])
    )
  // .subscribe(data => {
  //   console.log('HIER', data);
  // });
}

export {
  convertNote,
  convertToVexFlow,
}