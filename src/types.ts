export type RenderScoreArgs = {
  width: number
  height: number
  padding: number
  ppq: number
  numerator: number
  denominator: number
  quantizeValue: number
  div: HTMLDivElement
  midiNotes: Heartbeat.MIDINote[]
}

export type NoteMapping = {
  midiNoteByStaveNoteId: { [id: string]: Heartbeat.MIDINote }
  staveNoteByMIDINoteId: { [id: string]: Vex.Flow.StaveNote }
}

export type SVGElementById = {
  [id: string]: SVGGElement
}

export type HitAreaById = {
  [id: string]: HTMLDivElement
}

export type HitAreaListener = (id: string, hitElement: HTMLDivElement, staveNote: Vex.Flow.StaveNote) => void;
