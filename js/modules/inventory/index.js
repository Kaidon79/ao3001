import { eventBus } from '../../core/eventBus.js';

const itemDatabase = [
  { id: 'health_potion', name: 'Heiltrank', type: 'consumable', icon: '🧪', effect: { hp: 50 }, value: 10 },
  { id: 'mana_potion', name: 'Manatrank', type: 'consumable', icon: '💧', effect: { mp: 40 }, value: 8 },
  { id: 'iron_sword', name: 'Eisenschwert', type: 'weapon', icon: '⚔️', slot: 'weapon', stats: { atk: 5 }, value: 50 },
  { id: 'leather_helmet', name: 'Lederhelm', type: 'armor', icon: '🪖', slot: 'head', stats: { def: 2 }, value: 30 },
];

const slotLabels = {
  head: 'Kopf', chest: 'Brust', weapon: 'Waffe', shield: 'Schild', ring: 'Ring', neck: 'Hals'
};

export const inventoryModule = {
  player: null,

  init(player) {
    this.player = player;
    if (!this.player.inventory) this.player.inventory = [];
    if (!this.player.equipment) this.player.equipment = {};
    eventBus.on('player.updated', () => {
      const activeTab = document.querySelector('.tab-pane.active')?.id;
      if (activeTab === 'tab-inventar') this.render();
    });
  },

  show() {
    this.render();
  },

  addItem(itemId) {
    const item = itemDatabase.find(i => i.id === itemId);
    if (!item) return;
    this.player.inventory.push({ ...item });
    this.player.save();
    eventBus.emit('player.updated', this.player);
  },

  equipItem(index) {
    const item = this.player.inventory[index];
    if (!item || !item.slot) return;
    if (this.player.equipment[item.slot]) {
      this.player.inventory.push(this.player.equipment[item.slot]);
    }
    this.player.equipment[item.slot] = item;
    this.player.inventory.splice(index, 1);
    this.player.save();
    eventBus.emit('player.updated', this.player);
  },

  unequipSlot(slot) {
    if (!this.player.equipment[slot]) return;
    this.player.inventory.push(this.player.equipment[slot]);
    delete this.player.equipment[slot];
    this.player.save();
    eventBus.emit('player.updated', this.player);
  },

  useItem(index) {
    const item = this.player.inventory[index];
    if (!item || item.type !== 'consumable') return;
    if (item.effect.hp) {
      this.player.hp = Math.min(this.player.hpMax, this.player.hp + item.effect.hp);
    }
    if (item.effect.mp) {
      this.player.mp = Math.min(this.player.mpMax, this.player.mp + item.effect.mp);
    }
    this.player.inventory.splice(index, 1);
    this.player.save();
    eventBus.emit('player.updated', this.player);
  },

  render() {
    const container = document.getElementById('inventory-content');
    if (!container) return;

    let html = '<div class="page-title">Inventar</div>';
    html += '<div class="section-divider"></div>';

    // Ausrüstung
    html += '<div class="panel"><div class="panel-title">Ausrüstung</div>';
    html += '<div class="equipment-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
    const slots = ['head', 'chest', 'weapon', 'shield', 'ring', 'neck'];
    slots.forEach(slot => {
      const item = this.player.equipment[slot];
      html += `
        <div class="equip-slot" data-slot="${slot}">
          <div>${slotLabels[slot] || slot}</div>
          ${item ? `<span>${item.icon} ${item.name}</span>` : '<span class="text-muted">— leer —</span>'}
        </div>
      `;
    });
    html += '</div></div>';

    // Inventarliste
    html += '<div class="panel" style="margin-top:16px;"><div class="panel-title">Rucksack</div>';
    if (this.player.inventory.length === 0) {
      html += '<p class="text-muted">Dein Inventar ist leer.</p>';
    } else {
      html += '<div class="inventory-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">';
      this.player.inventory.forEach((item, index) => {
        html += `
          <div class="inventory-item" data-index="${index}">
            <div>${item.icon} ${item.name}</div>
            ${item.type === 'consumable' 
              ? `<button class="btn-small use-item">Benutzen</button>` 
              : item.slot 
                ? `<button class="btn-small equip-item">Ausrüsten</button>` 
                : ''}
          </div>
        `;
      });
      html += '</div>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Event-Listener
    container.querySelectorAll('.equip-slot').forEach(slotDiv => {
      slotDiv.addEventListener('click', () => {
        this.unequipSlot(slotDiv.dataset.slot);
      });
    });

    container.querySelectorAll('.use-item').forEach(btn => {
      const itemDiv = btn.closest('.inventory-item');
      const index = itemDiv.dataset.index;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.useItem(parseInt(index));
      });
    });

    container.querySelectorAll('.equip-item').forEach(btn => {
      const itemDiv = btn.closest('.inventory-item');
      const index = itemDiv.dataset.index;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.equipItem(parseInt(index));
      });
    });
  }
};