import { eventBus } from './core/eventBus.js';
import { Player } from './core/player.js';
import { xpForLevel } from './core/utils.js';
import { initTabs } from './ui/tabs.js';
import { renderAll } from './ui/render.js';
import { inventoryModule } from './modules/inventory/index.js'; // NEU

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
window.player = player; // global für Debug und Module

// --- 3. Event-Bus abonnieren für UI-Updates ---
eventBus.on('player.updated', (p) => {
  const activeTab = document.querySelector('.tab-pane.active')?.id.replace('tab-', '') || 'dashboard';
  renderAll(p, activeTab);
});

// --- 4. Module initialisieren ---
inventoryModule.init(player); // NEU

// --- 5. Tabs initialisieren ---
initTabs();

// --- 6. Tab-Wechsel abfangen, um Modulen Bescheid zu geben ---
const originalShowTab = window.showTab;
window.showTab = function(tabId) {
  originalShowTab(tabId); // bestehende Logik ausführen
  if (tabId === 'dungeon') {
    // dungeonModule.show(); später
  } else if (tabId === 'inventar') {
    inventoryModule.show();
  }
};

// --- 7. Initiales Rendern ---
renderAll(player, 'dashboard');