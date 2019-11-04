import { createSong } from './create-song';
import { renderScore, addHitAreas } from './create-score';
import { colorStaveNote, addListeners } from './score-interactivity';

const settings = {
  ppq: 960,
  numerator: 4,
  denominator: 4,
  padding: 10,
  quantizeValue: 16,
}
type Settings = typeof settings;

const init = async (settings: Settings) => {
  const { ppq, numerator, denominator, padding, quantizeValue } = settings;
  const div = document.getElementById('app') as HTMLDivElement;
  const divHitArea = document.getElementById('hitareas') as HTMLDivElement;
  const tooltip = document.getElementById('tooltip') as HTMLDivElement;
  const btnPlay = document.getElementById('play') as HTMLButtonElement;
  const btnStop = document.getElementById('stop') as HTMLButtonElement;

  if (div === null || divHitArea === null || tooltip === null) {
    return;
  }
  const song = await createSong(ppq, numerator, denominator);

  const render = (fullRender: boolean = false) => {
    const [staveNotes, noteMapping, context] = renderScore({
      width: window.innerWidth,
      height: window.innerHeight,
      ppq,
      numerator,
      denominator,
      quantizeValue,
      padding,
      div,
      midiNotes: song.notes,
    });
    if (fullRender === true) {
      // use `fullRender=true` only when the heartbeat song has changed, or for the first call to render
      const offset = context.svg.getBoundingClientRect();
      const [svgElementById, hitAreaById] = addHitAreas(staveNotes, divHitArea, offset);
      // console.log(svgElementById, staveNotes, noteMapping);
      addListeners(hitAreaById, noteMapping, tooltip);

      // connect all note-on and note-off events to the stavenote in the score
      song.notes.forEach((n) => {
        song.addEventListener('event', 'type = NOTE_ON', (event) => {
          const noteId = event.midiNote.id;
          const el = noteMapping.staveNoteByMIDINoteId[noteId].attrs.el;
          colorStaveNote(el, 'red');
        });

        song.addEventListener('event', 'type = NOTE_OFF', (event) => {
          const noteId = event.midiNote.id;
          const el = noteMapping.staveNoteByMIDINoteId[noteId].attrs.el;
          colorStaveNote(el, 'black');
        });
      });
    }
  }
  // the intial render
  render(true);

  // on resize we only have to render the VexFlow score, we don't need to add the listeners so we
  // pass `false` to the render call
  window.addEventListener('resize', () => { render(false); });

  // add the regular song controls
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

init(settings);