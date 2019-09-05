import { from, of } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
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

const convertNote = (ppq: number, note: Heartbeat.MIDINote): [number, Vex.Flow.StaveNote] => {
  // console.log(note);
  const ratio = round(note.durationTicks / ppq);
  const {
    name,
    octave,
  } = note.note;
  const duration = getDuration(ratio);
  // console.log(name, octave, ratio, duration);
  const sn = new StaveNote({ clef: 'treble', keys: [`${name}/${octave}`], duration: duration[0] });
  if (duration[1]) {
    sn.addDot(0);
  }
  sn.setPlayNote({ noteId: note.id });
  return [note.noteOn.ticks, sn];
}

const convertBars = (barLength: number, data: [number, Vex.Flow.StaveNote]) => {

}

const convertToVexFlow = (song: Heartbeat.Song): any => {
  const notes = song.notes;
  const convert = curry<(ppq: number, note: Heartbeat.MIDINote) => [number, Vex.Flow.StaveNote]>(convertNote)(song.ppq);
  const bars = curry<(barLength: number, data: [number, Vex.Flow.StaveNote]) => Vex.Flow.StaveNote>(convertBars)(song.ppq * song.denominator);
  from(notes)
    .pipe(
      // tap(console.log),
      map(convert),
      switchMap(data => {
        console.log(data);
        const bars: Vex.Flow.Stave[] = [];
        let i = 0;
        let ticks = 0;
        let y = 40 + (i * 100);
        const w = 300;
        let stave = new Vex.Flow.Stave(0, y, w);
        // data.forEach((d: [number, Vex.Flow.StaveNote]) => {
        //   ticks += d[0];
        // });
        return of(bars)
      }),
    )
    .subscribe(console.log)
}

export {
  convertNote,
  convertToVexFlow,
}