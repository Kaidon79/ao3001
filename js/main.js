import { eventBus } from './core/eventBus.js';
import { Player } from './core/player.js';
import { xpForLevel } from './core/utils.js';
import { initTabs } from './ui/tabs.js';
import { renderAll } from './ui/render.js';

// --- 1. Lade aktiven Charakter aus localStorage ---
const activeChar = JSON.parse(localStorage.getItem('ashcrown_active_char') || 'null');
if (!activeChar) {
  window.location.href = 'account.html';
  throw new Error('Kein aktiver Charakter gefunden.');
}

const charKey = `ashcrown_char_${activeChar.username}_${activeChar.charName}`;
const savedChar = localStorage.getItem(charKey);
if (!savedChar) {
  window.location.href = 'account.html';
  throw new Error('Charakterdaten nicht gefunden.');
}

const playerData = JSON.parse(savedChar);

// --- 2. Player-Instanz erzeugen ---
const player = new Player(playerData);

// --- 3. Event-Bus abonnieren für UI-Updates ---
eventBus.on('player.updated', (p) => {
  // Ermittle aktuell aktiven Tab
  const activeTab = document.querySelector('.tab-pane.active')?.id.replace('tab-', '') || 'dashboard';
  renderAll(p, activeTab);
});

// --- 4. Tabs initialisieren ---
initTabs();

// --- 5. Initiales Rendern ---
renderAll(player, 'dashboard');

// --- 6. Player in globales Fenster hängen (für Debug, später optional) ---
window.player = player; // Nur für Tests in der Konsole

// --- 7. Beispiel: Wenn du das Dungeon-Modul später einbindest, hier registrieren ---
// import { dungeonModule } from './modules/dungeon/index.js';
// dungeonModule.init(player, eventBus);