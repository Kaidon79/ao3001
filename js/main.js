import { eventBus } from './core/eventBus.js';
import { Player } from './core/player.js';
import { xpForLevel } from './core/utils.js';
import { initTabs } from './ui/tabs.js';
import { renderAll } from './ui/render.js';
import { inventoryModule } from './modules/inventory/index.js';
import { dungeonModule } from './modules/dungeon/index.js';

// --- 1. Lade aktiven Charakter ---
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
const player = new Player(playerData);
window.player = player;

// --- 2. Events ---
eventBus.on('player.updated', (p) => {
  const activeTab = document.querySelector('.tab-pane.active')?.id.replace('tab-', '') || 'dashboard';
  renderAll(p, activeTab);
});

// --- 3. Module initialisieren ---
inventoryModule.init(player);
dungeonModule.init(player);

// --- 4. Tabs initialisieren ---
initTabs();

// --- 5. Tab-Wechsel abfangen ---
const originalShowTab = window.showTab;
window.showTab = function(tabId) {
  originalShowTab(tabId);
  if (tabId === 'inventar') inventoryModule.show();
  else if (tabId === 'dungeon') dungeonModule.show();
};

// --- 6. Initial rendern ---
renderAll(player, 'dashboard');