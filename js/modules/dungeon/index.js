import { eventBus } from '../../core/eventBus.js';

const dungeons = [
  {
    id: 'goblin_cave',
    name: 'Goblin-Höhle',
    icon: '🕳️',
    minLevel: 1,
    maxLevel: 5,
    desc: 'Eine feuchte Höhle voller hungriger Goblins.',
    rooms: 2,
    enemies: [
      { name: 'Goblin', icon: '👺', hp: 30, atk: 4, def: 1, xp: 25, gold: 3 },
      { name: 'Goblin-Krieger', icon: '👹', hp: 45, atk: 6, def: 2, xp: 35, gold: 5 }
    ],
    boss: { name: 'Goblin-Anführer', icon: '👿', hp: 120, atk: 10, def: 4, xp: 100, gold: 20 },
    baseXP: 100,
    baseGold: 30
  },
  {
    id: 'undead_crypt',
    name: 'Verfluchte Krypta',
    icon: '⚰️',
    minLevel: 3,
    maxLevel: 8,
    desc: 'Skelette und Geister bewachen uralte Schätze.',
    rooms: 3,
    enemies: [
      { name: 'Skelett', icon: '💀', hp: 40, atk: 5, def: 2, xp: 30, gold: 4 },
      { name: 'Geist', icon: '👻', hp: 35, atk: 8, def: 1, xp: 40, gold: 6 }
    ],
    boss: { name: 'Lich', icon: '🧟', hp: 150, atk: 15, def: 5, xp: 150, gold: 35 },
    baseXP: 150,
    baseGold: 45
  }
];

export const dungeonModule = {
  player: null,
  state: {
    phase: 'select',
    currentDungeon: null,
    currentRoom: 0,
    currentEnemy: null,
    combatLog: [],
    autoTimer: null
  },

  init(player) {
    this.player = player;
    eventBus.on('player.updated', () => {
      const activeTab = document.querySelector('.tab-pane.active')?.id;
      if (activeTab === 'tab-dungeon') this.render();
    });
  },

  show() {
    if (this.state.phase === 'select' || this.state.phase === 'result') {
      this.state.phase = 'select';
      this.state.currentDungeon = null;
      this.state.currentEnemy = null;
      this.state.combatLog = [];
      this.stopTimer();
    }
    this.render();
  },

  log(msg) {
    this.state.combatLog.unshift({ message: msg });
    if (this.state.combatLog.length > 20) this.state.combatLog.pop();
  },

  stopTimer() {
    if (this.state.autoTimer) {
      clearInterval(this.state.autoTimer);
      this.state.autoTimer = null;
    }
  },

  spawnEnemy(isBoss) {
    const d = this.state.currentDungeon;
    if (!d) return null;
    const template = isBoss ? d.boss : d.enemies[Math.floor(Math.random() * d.enemies.length)];
    const factor = 1 + (this.player.level - 1) * 0.1;
    return {
      ...template,
      hp: Math.floor(template.hp * factor),
      hpMax: Math.floor(template.hp * factor),
      atk: Math.floor(template.atk * factor),
      def: Math.floor(template.def * factor)
    };
  },

  loadNextRoom() {
    const d = this.state.currentDungeon;
    if (!d) return;
    if (this.state.currentRoom < d.rooms) {
      this.state.currentEnemy = this.spawnEnemy(false);
      this.log(`Raum ${this.state.currentRoom + 1}: Ein ${this.state.currentEnemy.name} erscheint!`);
    } else {
      this.state.currentEnemy = this.spawnEnemy(true);
      this.log(`⚠️ BOSS: ${this.state.currentEnemy.name} erscheint!`);
    }
  },

  combatTick() {
    if (this.state.phase !== 'combat' || !this.state.currentEnemy) return;
    const enemy = this.state.currentEnemy;
    const player = this.player;

    const playerAtk = 10 + player.str * 3 + player.dex;
    let dmg = Math.max(1, playerAtk - enemy.def + Math.floor(Math.random() * 5));
    enemy.hp -= dmg;
    this.log(`⚔️ Du triffst ${enemy.name} für ${dmg} Schaden.`);

    if (enemy.hp <= 0) {
      this.log(`💀 ${enemy.name} wurde besiegt!`);
      const isBoss = (this.state.currentRoom >= this.state.currentDungeon.rooms);
      if (isBoss) {
        this.finishDungeon(true);
      } else {
        this.state.currentRoom++;
        this.loadNextRoom();
      }
      this.render();
      return;
    }

    let enemyDmg = Math.max(1, enemy.atk - Math.floor(player.str / 2) + Math.floor(Math.random() * 4));
    player.takeDamage(enemyDmg);
    this.log(`👹 ${enemy.name} trifft dich für ${enemyDmg} Schaden.`);

    if (player.hp <= 0) {
      this.finishDungeon(false);
    }

    this.render();
  },

  finishDungeon(success) {
    this.stopTimer();
    const d = this.state.currentDungeon;
    if (!d) return;

    if (success) {
      const xp = d.baseXP + 50;
      const gold = d.baseGold + 20;
      this.player.addXP(xp);
      this.player.addGold(gold);
      this.log(`🏆 Dungeon abgeschlossen! +${xp} XP, +${gold} Gold`);
      this.player.stats.dungeons++;
    } else {
      const loss = Math.floor(d.baseGold / 2) || 10;
      this.player.addGold(-loss);
      this.log(`💔 Du wurdest besiegt. Verlierst ${loss} Gold.`);
      this.player.stats.deaths++;
    }
    this.player.save();
    this.state.phase = 'result';
    this.render();
  },

  selectDungeon(dungeonId) {
    const d = dungeons.find(d => d.id === dungeonId);
    if (!d) return;
    if (this.player.level < d.minLevel) {
      alert('Mindestlevel nicht erreicht.');
      return;
    }

    this.player.hp = this.player.hpMax;
    this.player.mp = this.player.mpMax;
    this.player.save();
    eventBus.emit('player.updated', this.player);

    this.stopTimer();
    this.state = {
      phase: 'combat',
      currentDungeon: d,
      currentRoom: 0,
      currentEnemy: null,
      combatLog: [],
      autoTimer: null
    };
    this.loadNextRoom();
    this.state.autoTimer = setInterval(() => this.combatTick(), 2500);
    this.render();
  },

  playerAction(action) {
    if (this.state.phase !== 'combat') return;
    if (action === 'attack') {
      this.combatTick();
    } else if (action === 'defend') {
      this.log('🛡 Du verteidigst dich.');
    } else if (action === 'flee') {
      this.log('🏃 Du fliehst.');
      this.finishDungeon(false);
    }
  },

  backToSelection() {
    this.stopTimer();
    this.state = {
      phase: 'select',
      currentDungeon: null,
      currentRoom: 0,
      currentEnemy: null,
      combatLog: [],
      autoTimer: null
    };
    this.render();
  },

  render() {
    const container = document.getElementById('dungeon-content');
    if (!container) return;

    if (this.state.phase === 'select') {
      let html = '<div class="page-title">Dungeon-Auswahl</div><div class="dungeon-list">';
      dungeons.forEach(d => {
        const disabled = this.player.level < d.minLevel ? 'disabled' : '';
        html += `
          <div class="dungeon-card ${disabled}" data-dungeon-id="${d.id}">
            <span class="dungeon-icon">${d.icon}</span>
            <div class="dungeon-info">
              <div class="dungeon-name">${d.name}</div>
              <div class="dungeon-desc">${d.desc}</div>
              <div class="dungeon-level">Empfohlen: Level ${d.minLevel}–${d.maxLevel}</div>
            </div>
          </div>
        `;
      });
      html += '</div>';
      container.innerHTML = html;

      container.querySelectorAll('.dungeon-card').forEach(card => {
        card.addEventListener('click', () => {
          this.selectDungeon(card.dataset.dungeonId);
        });
      });
    } else if (this.state.phase === 'combat' && this.state.currentEnemy) {
      const player = this.player;
      const enemy = this.state.currentEnemy;
      const playerHpPercent = (player.hp / player.hpMax) * 100;
      const enemyHpPercent = (enemy.hp / enemy.hpMax) * 100;

      let html = `
        <div class="page-title">${this.state.currentDungeon.name}</div>
        <div class="page-sub">Raum ${this.state.currentRoom + 1} / ${this.state.currentDungeon.rooms + 1}</div>
        <div class="combat-container">
          <div class="combat-row">
            <div class="combat-creature">
              <div class="combat-icon">⚔️</div>
              <div class="combat-name">${player.name}</div>
              <div class="combat-hp-bar"><div class="combat-hp-fill" style="width:${playerHpPercent}%"></div></div>
              <div>${player.hp}/${player.hpMax} HP</div>
              <div>${player.mp}/${player.mpMax} MP</div>
            </div>
            <div class="combat-vs">VS</div>
            <div class="combat-creature">
              <div class="combat-icon">${enemy.icon}</div>
              <div class="combat-name">${enemy.name}</div>
              <div class="combat-hp-bar"><div class="combat-hp-fill" style="width:${enemyHpPercent}%"></div></div>
              <div>${enemy.hp}/${enemy.hpMax} HP</div>
            </div>
          </div>
          <div class="combat-log" id="combat-log">
            ${this.state.combatLog.map(e => `<div class="combat-log-entry">${e.message}</div>`).join('')}
          </div>
          <div class="combat-actions">
            <button class="btn-combat primary" id="combat-attack">⚔️ Angreifen</button>
            <button class="btn-combat" id="combat-defend">🛡️ Verteidigen</button>
            <button class="btn-combat danger" id="combat-flee">🏃 Fliehen</button>
          </div>
        </div>
      `;
      container.innerHTML = html;

      document.getElementById('combat-attack').addEventListener('click', () => this.playerAction('attack'));
      document.getElementById('combat-defend').addEventListener('click', () => this.playerAction('defend'));
      document.getElementById('combat-flee').addEventListener('click', () => this.playerAction('flee'));
    } else if (this.state.phase === 'result') {
      const success = this.state.currentEnemy?.hp <= 0;
      container.innerHTML = `
        <div class="combat-result">
          <div class="coming-soon-icon">${success ? '🏆' : '💔'}</div>
          <div class="coming-soon-title">${success ? 'Dungeon abgeschlossen!' : 'Du wurdest besiegt...'}</div>
          <button class="btn-combat primary" id="back-to-selection">← Zurück zur Auswahl</button>
        </div>
      `;
      document.getElementById('back-to-selection').addEventListener('click', () => this.backToSelection());
    }
  }
};