import { interact } from './interaction.js';
import { craftSword, craftAxe, craftBow, craftArrows, eatFruit } from '../items/crafting.js';
import { castFireball, tryAttack } from './combat.js';
import { setWeapon } from '../items/viewmodels.js';
import { state } from '../state.js';
import { togglePause } from '../ui/screens.js';
import { showToast } from '../ui/hud.js';

export function handleKeyPress(k) {
  if (k === 'KeyP') { togglePause(); return; }
  if (k === 'KeyH') {
    const help = document.getElementById('help');
    help.style.display = help.style.display === 'none' ? 'block' : 'none';
    return;
  }
  if (k === 'KeyE') interact(showToast);
  if (k === 'KeyK') craftSword(showToast);
  if (k === 'KeyC') craftAxe(showToast);
  if (k === 'KeyB') craftBow(showToast);
  if (k === 'KeyV') craftArrows(showToast);
  if (k === 'KeyG') eatFruit(showToast);
  if (k === 'KeyQ') castFireball(showToast);
  if (k === 'Digit1') setWeapon('fist', showToast);
  if (k === 'Digit2') setWeapon('sword', showToast);
  if (k === 'Digit3') setWeapon('axe', showToast);
  if (k === 'Digit4') setWeapon('bow', showToast);
  if (k === 'Space' || k === 'KeyF') tryAttack(showToast);
}