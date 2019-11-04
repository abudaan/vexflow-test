import 'jzz';
import sequencer from 'heartbeat-sequencer';
import { addAssetPack, loadJSON } from './heartbeat-utils';

export const createSong = async (ppq: number, numerator: number, denominator: number): Promise<Heartbeat.Song> => {
  await sequencer.ready();
  const song = sequencer.createSong({ bars: 1 });
  const track = sequencer.createTrack('piano');
  const part = sequencer.createPart();
  const srcName = 'TP00-PianoStereo';
  let url = `https://groovy3.heartbeatjs.org/assets/groovy-instruments/mono-mp3-112/${srcName}.mp3.112.json`;
  if (sequencer.browser === 'firefox') {
    url = `https://heartbeatjs.org/groovy-instruments/mono-22k-q1/${srcName}.json`;
  }
  const json = await loadJSON(url);
  await addAssetPack(json);
  const events = [
    sequencer.createMidiEvent(0, 144, 60, 100),
    sequencer.createMidiEvent(ppq * 1, 128, 60, 0),

    sequencer.createMidiEvent(ppq * 1, 144, 64, 100),
    sequencer.createMidiEvent(ppq * 2, 128, 64, 0),

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