import { from, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, mergeMap, reduce } from 'rxjs/operators';
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
  console.log(note.noteOn, name, octave, ratio, duration);
  const sn = new StaveNote({ clef: 'treble', keys: [`${name}/${octave}`], duration: duration[0] });
  if (duration[1]) {
    sn.addDot(0);
  }
  sn.setPlayNote({ noteId: note.id });
  return [note, sn];
}

const convertBars = (barLength: number, data: [Heartbeat.MIDINote, Vex.Flow.StaveNote]) => {

}

type TypeArgs = {
  song: Heartbeat.Song
  renderer: Vex.Flow.Renderer
  formatter: Vex.Flow.Formatter
  context: Vex.Flow.SVGContext
}

const convertToVexFlow = ({ song, renderer, context, formatter }: TypeArgs): any => {
  const notes = song.notes;
  const convert = curry<(ppq: number, note: Heartbeat.MIDINote) => [Heartbeat.MIDINote, Vex.Flow.StaveNote]>(convertNote)(song.ppq);
  const bars = curry<(barLength: number, data: [Heartbeat.MIDINote, Vex.Flow.StaveNote]) => Vex.Flow.StaveNote>(convertBars)(song.ppq * song.denominator);
  const barLength = song.ppq * song.nominator;
  from(notes)
    .pipe(
      // tap(console.log),
      map(convert),
      // mergeMap(data => of(data)),
      reduce((acc: [Heartbeat.MIDINote, Vex.Flow.StaveNote][], val: [Heartbeat.MIDINote, Vex.Flow.StaveNote]) => {
        acc.push(val);
        return acc;
      }, []),
      mergeMap((data: [Heartbeat.MIDINote, Vex.Flow.StaveNote][]) => {
        //   // console.log(data);
        const bars: Vex.Flow.Stave[] = [];
        let bar = -1;
        let currentTick = 0;
        let y = 40 + ((bar - 1) * 100);
        const w = 300;
        let stave = new Vex.Flow.Stave(0, y, w);
        stave.addClef('treble').addTimeSignature('4/4');
        let voice = new Voice({ num_beats: song.nominator, beat_value: song.denominator });
        let notes: Vex.Flow.StaveNote[] = []

        bars.push(stave);
        data.forEach(datum => {
          const [
            midiNote,
            note,
          ] = datum;
          if (midiNote.noteOn.bar !== bar) {
            bar = midiNote.noteOn.bar;
          }
          // console.log('TICKS', ticks, bar, (bar * barLength), notes.length);
          if (ticks > (bar * barLength)) {
            // console.log('BAR', bar, notes);
            // voice.addTickables([...notes]);
            // formatter.joinVoices([voice]).format([voice], w);
            // voice.draw(context, stave);
            bar++;
            voice = new Voice({ num_beats: song.nominator, beat_value: song.denominator });
            notes = [];
            let y = 40 + ((bar - 1) * 100);
            stave = new Vex.Flow.Stave(0, y, w);
            bars.push(stave);
          }
          notes.push(note);
        });
        return of(bars);
      }),
    )
    .subscribe(console.log)
}

export {
  convertNote,
  convertToVexFlow,
}