import { eventBus } from '../../core/eventBus.js';
import { dungeons } from './data.js';
import { renderDungeonList, renderCombat, renderResult } from './render.js';

// Privater Zustand des Moduls
let state = {
  phase: 'select', // 'select', 'combat', 'result'
  currentDungeon: null,
  currentRoom: 0,
  currentEnemy: null,
  combatLog: [],
  autoTimer: null
};

// Hilfsfunktionen
function log(message, type = 'info') {
  state.combatLog.unshift({ message, type, time: Date.now() });
  if (state.combatLog.length > 20) state.combatLog.pop();
}

function stopAutoTimer() {
  if (state.autoTimer) {
    clearInterval(state.autoTimer);
    state.autoTimer = null;
  }
}

// Gegner spawnen (mit Level-Skalierung)
function spawnEnemy(isBoss = false, playerLevel) {
  const dungeon = state.currentDungeon;
  if (!dungeon) return null;

  let template;
  if (isBoss) {
    template = dungeon.boss;
  } else {
    const idx = Math.floor(Math.random() * dungeon.enemies.length);
    template = dungeon.enemies[idx];
  }

  const levelFactor = 1 + (playerLevel - 1) * 0.1;
  return {
    ...template,
    hp: Math.floor(template.hp * levelFactor),
    hpMax: Math.floor(template.hp * levelFactor),
    atk: Math.floor(template.atk * levelFactor),
    def: Math.floor(template.def * levelFactor)
  };
}

// Nächsten Raum laden
function loadNextRoom(player) {
  const dungeon = state.currentDungeon;
  if (!dungeon) return;

  if (state.currentRoom < dungeon.rooms) {
    state.currentEnemy = spawnEnemy(false, player.level);
    log(`Raum ${state.currentRoom + 1}: Ein ${state.currentEnemy.name} erscheint!`);
  } else {
    state.currentEnemy = spawnEnemy(true, player.level);
    log(`⚠️ BOSS: ${state.currentEnemy.name} erscheint!`);
  }
}

// Kampf-Tick (Auto-Angriff)
function combatTick(player) {
  if (state.phase !== 'combat' || !state.currentEnemy) return;

  const enemy = state.currentEnemy;

  // Spieler-Angriff
  const playerAtk = 10 + player.str * 3 + player.dex;
  let dmg = Math.max(1, playerAtk - enemy.def + Math.floor(Math.random() * 5));
  enemy.hp -= dmg;
  log(`⚔️ Du triffst ${enemy.name} für ${dmg} Schaden.`, 'player');

  if (enemy.hp <= 0) {
    log(`💀 ${enemy.name} wurde besiegt!`, 'enemy');
    const isBoss = (state.currentRoom >= state.currentDungeon.rooms);
    if (isBoss) {
      finishDungeon(true, player);
    } else {
      state.currentRoom++;
      loadNextRoom(player);
    }
    render();
    return;
  }

  // Gegner-Angriff
  let enemyDmg = Math.max(1, enemy.atk - Math.floor(player.str / 2) + Math.floor(Math.random() * 4));
  player.takeDamage(enemyDmg);
  log(`👹 ${enemy.name} trifft dich für ${enemyDmg} Schaden.`, 'enemy');

  if (player.hp <= 0) {
    log('💔 Du wurdest besiegt...', 'player');
    finishDungeon(false, player);
  }

  render();
}

// Dungeon beenden (Sieg oder Niederlage)
function finishDungeon(success, player) {
  stopAutoTimer();
  const dungeon = state.currentDungeon;
  if (!dungeon) return;

  if (success) {
    // Belohnungen berechnen (einfach gehalten)
    const totalXP = dungeon.baseXP + 50;
    const totalGold = dungeon.baseGold + 20;

    player.addXP(totalXP);
    player.addGold(totalGold);

    log(`🏆 Dungeon abgeschlossen! +${totalXP} XP, +${totalGold} Gold`, 'win');
    player.stats.dungeons = (player.stats.dungeons || 0) + 1;
  } else {
    // Niederlage: Spieler verliert etwas Gold
    const loss = Math.floor((dungeon.baseGold / 2) || 10);
    player.addGold(-loss);
    log(`💔 Du konntest nicht siegen. Verlierst ${loss} Gold.`, 'lose');
    player.stats.deaths = (player.stats.deaths || 0) + 1;
  }

  state.phase = 'result';
  player.save();
  render();
}

// UI aktualisieren (ruft die Render-Funktionen auf und schreibt ins DOM)
function render() {
  const container = document.getElementById('dungeon-content');
  if (!container) return;

  const player = window.player; // Zugriff auf die globale Player-Instanz

  if (state.phase === 'select') {
    container.innerHTML = renderDungeonList(dungeons, player.level, 'DungeonModule.selectDungeon');
  } else if (state.phase === 'combat' && state.currentEnemy) {
    container.innerHTML = renderCombat(
      state.currentDungeon,
      state.currentRoom,
      state.currentEnemy,
      player,
      state.combatLog
    );
    // Auto-scroll im Log
    const logEl = document.getElementById('combat-log');
    if (logEl) logEl.scrollTop = 0;
  } else if (state.phase === 'result') {
    container.innerHTML = renderResult(state.currentEnemy ? state.currentEnemy.hp <= 0 : false);
  }
}

// Öffentliche API des Moduls
export const dungeonModule = {
  // Wird beim Start vom Hauptprogramm aufgerufen
  init(player) {
    // Event-Bus abonnieren, falls nötig
    eventBus.on('player.updated', (p) => {
      // Nur neu rendern, wenn wir im Dungeon-Tab sind
      const activeTab = document.querySelector('.tab-pane.active')?.id;
      if (activeTab === 'tab-dungeon') {
        render();
      }
    });
  },

  // Wird aufgerufen, wenn der Dungeon-Tab aktiv wird
  show() {
    const player = window.player;
    // Wenn wir uns nicht in einem aktiven Kampf befinden, zeige die Auswahl
    if (state.phase === 'select' || state.phase === 'result') {
      state.phase = 'select';
      state.currentDungeon = null;
      state.currentEnemy = null;
      state.combatLog = [];
      stopAutoTimer();
    }
    render();
  },

  // Dungeon auswählen
  selectDungeon(dungeonId) {
    const player = window.player;
    const dungeon = dungeons.find(d => d.id === dungeonId);
    if (!dungeon) return;
    if (player.level < dungeon.minLevel) {
      alert('Du erfüllst nicht das Mindestlevel für diesen Dungeon.');
      return;
    }

    stopAutoTimer();
    state = {
      phase: 'combat',
      currentDungeon: dungeon,
      currentRoom: 0,
      currentEnemy: null,
      combatLog: [],
      autoTimer: null
    };

    loadNextRoom(player);
    state.autoTimer = setInterval(() => combatTick(player), 2500);
    render();
  },

  // Spieleraktion im Kampf
  playerAction(action) {
    const player = window.player;
    if (state.phase !== 'combat') return;

    if (action === 'attack') {
      combatTick(player); // sofort ein Tick
    } else if (action === 'defend') {
      log('🛡 Du bereitest dich zu verteidigen vor.', 'player');
      // Verteidigungsbonus könnte im Tick eingebaut werden (später)
    } else if (action === 'flee') {
      log('🏃 Du fliehst aus dem Dungeon.', 'player');
      finishDungeon(false, player);
    }
  },

  // Zurück zur Auswahl
  backToSelection() {
    stopAutoTimer();
    state = {
      phase: 'select',
      currentDungeon: null,
      currentRoom: 0,
      currentEnemy: null,
      combatLog: [],
      autoTimer: null
    };
    render();
  }
};

// Für onclick-Zugriffe global verfügbar machen
window.DungeonModule = dungeonModule;