import { eventBus } from './eventBus.js';
import { xpForLevel } from './utils.js';
import { BASE_HP, BASE_MP } from './constants.js';

export class Player {
  constructor(data) {
    // Basisdaten
    this.name = data.name || 'Held';
    this.cls = data.cls || 'Krieger';
    this.icon = data.icon || '⚔️';
    this.level = data.level || 1;
    this.xp = data.xp || 0;
    this.gold = data.gold || 50;

    // Attribute
    this.str = data.str || 5;
    this.int = data.int || 5;
    this.dex = data.dex || 5;

    // Lebenspunkte
    this.hp = data.hp || this.calcMaxHp();
    this.hpMax = data.hpMax || this.calcMaxHp();
    this.mp = data.mp || this.calcMaxMp();
    this.mpMax = data.mpMax || this.calcMaxMp();

    // Inventar / Ausrüstung (später)
    this.inventory = data.inventory || [];
    this.equipment = data.equipment || {};

    // Statistik (optional)
    this.stats = data.stats || { dungeons: 0, kills: 0, deaths: 0 };

    // Nach der Initialisierung sofort Events feuern?
    // Eventuell nicht nötig, da UI sich beim Start sowieso rendert.
  }

  // Maximale HP basierend auf Stärke und Level
  calcMaxHp() {
    return BASE_HP + this.str * 8 + this.level * 5;
  }

  // Maximale MP basierend auf Intelligenz und Level
  calcMaxMp() {
    return BASE_MP + this.int * 6 + this.level * 3;
  }

  // Aktualisiert Max-Werte (nach Level-Up oder Attributsänderung)
  recalc() {
    this.hpMax = this.calcMaxHp();
    this.mpMax = this.calcMaxMp();
    if (this.hp > this.hpMax) this.hp = this.hpMax;
    if (this.mp > this.mpMax) this.mp = this.mpMax;
  }

  // XP hinzufügen, Level-Up prüfen
  addXP(amount) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= xpForLevel(this.level)) {
      this.xp -= xpForLevel(this.level);
      this.level++;
      leveled = true;
    }
    if (leveled) {
      this.recalc();
      eventBus.emit('player.levelUp', this.level);
    }
    eventBus.emit('player.xpChanged', this.xp, xpForLevel(this.level));
    eventBus.emit('player.updated', this);
  }

  // Gold hinzufügen/abziehen
  addGold(amount) {
    this.gold += amount;
    eventBus.emit('player.goldChanged', this.gold);
    eventBus.emit('player.updated', this);
  }

  // Schaden nehmen
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    eventBus.emit('player.hpChanged', this.hp, this.hpMax);
    eventBus.emit('player.updated', this);
    if (this.hp <= 0) {
      eventBus.emit('player.died');
    }
  }

  // Heilen
  heal(amount) {
    this.hp = Math.min(this.hpMax, this.hp + amount);
    eventBus.emit('player.hpChanged', this.hp, this.hpMax);
    eventBus.emit('player.updated', this);
  }

  // Mana verbrauchen
  useMana(amount) {
    this.mp = Math.max(0, this.mp - amount);
    eventBus.emit('player.mpChanged', this.mp, this.mpMax);
    eventBus.emit('player.updated', this);
  }

  // Mana wiederherstellen
  restoreMana(amount) {
    this.mp = Math.min(this.mpMax, this.mp + amount);
    eventBus.emit('player.mpChanged', this.mp, this.mpMax);
    eventBus.emit('player.updated', this);
  }

  // Charakter speichern (für später: Server-API)
  save() {
    // Hier nur localStorage fürs Erste
    const active = JSON.parse(localStorage.getItem('ashcrown_active_char') || 'null');
    if (active) {
      const key = `ashcrown_char_${active.username}_${active.charName}`;
      localStorage.setItem(key, JSON.stringify(this.toJSON()));
    }
  }

  // Exportiere relevante Daten für localStorage
  toJSON() {
    return {
      name: this.name,
      cls: this.cls,
      icon: this.icon,
      level: this.level,
      xp: this.xp,
      gold: this.gold,
      str: this.str,
      int: this.int,
      dex: this.dex,
      hp: this.hp,
      hpMax: this.hpMax,
      mp: this.mp,
      mpMax: this.mpMax,
      inventory: this.inventory,
      equipment: this.equipment,
      stats: this.stats,
    };
  }
}