import sequencer from 'heartbeat-sequencer';
import { HitAreaById, NoteMapping } from './types';

export const colorStaveNote = (el: SVGGElement, color: string) => {
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


export const addListeners = (hitAreas: HitAreaById, noteMapping: NoteMapping, tooltip: HTMLDivElement) => {
  Object.entries(hitAreas).forEach(([id, hit]: [string, HTMLDivElement]) => {
    hit.addEventListener('mousedown', (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      const midiNote = noteMapping.midiNoteByStaveNoteId[target.id];
      const staveNote = noteMapping.staveNoteByMIDINoteId[midiNote.id];
      const midiEvent = midiNote.noteOn;
      const noteOn = sequencer.createMidiEvent(0, 144, midiEvent.data1, midiEvent.data2)
      // const instrument = midiEvent.track.instrument;
      // console.log(instrument);
      // instrument.processEvent(noteOn);
      sequencer.processEvent(noteOn, 'TP00-PianoStereo');
      colorStaveNote(staveNote.attrs.el, 'red');
      showToolTip(tooltip, hit, midiEvent);
    })
    hit.addEventListener('mouseup', (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      const midiNote = noteMapping.midiNoteByStaveNoteId[target.id];
      const staveNote = noteMapping.staveNoteByMIDINoteId[midiNote.id];
      // const midiEvent = midiNote.noteOn;
      // const noteOff = sequencer.createMidiEvent(10, 128, midiEvent.data1, 0)
      // sequencer.processEvent(noteOff, '');
      sequencer.stopProcessEvents();
      colorStaveNote(staveNote.attrs.el, 'black');
      hideToolTip(tooltip);
    });
  });
};


const showToolTip = (tooltip: HTMLDivElement, hit: HTMLDivElement, data: Heartbeat.MIDIEvent) => {
  tooltip.style.display = 'block';
  tooltip.style.left = hit.style.left;
  tooltip.style.top = hit.style.top;
  tooltip.innerHTML = data.noteName;
}

const hideToolTip = (tooltip: HTMLDivElement) => {
  tooltip.style.display = 'none';
}