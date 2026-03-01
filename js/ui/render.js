import { xpForLevel, formatNumber } from '../core/utils.js';

export function renderTopbar(player) {
  const xpNeeded = xpForLevel(player.level);
  const xpPercent = xpNeeded > 0 ? Math.min(100, (player.xp / xpNeeded) * 100) : 100;
  const classIcons = { Krieger:'⚔️', Magier:'🔮', Priester:'✨', Jäger:'🏹' };
  const icon = classIcons[player.cls] || '⚔️';

  document.getElementById('tb-avatar').textContent = icon;
  document.getElementById('tb-name').textContent = player.name;
  document.getElementById('tb-class-level').textContent = `${player.cls} · Lv.${player.level}`;
  document.getElementById('tb-xp-text').textContent = `${formatNumber(player.xp)} / ${formatNumber(xpNeeded)}`;
  document.getElementById('tb-xp-fill').style.width = xpPercent + '%';
  document.getElementById('tb-gold').textContent = player.gold;
}

export function renderDashboard(player) {
  document.getElementById('dash-greeting').textContent = `Willkommen zurück, ${player.name}.`;
  document.getElementById('w-gold').textContent = player.gold;
  document.getElementById('w-level').textContent = player.level;
  document.getElementById('w-hp').textContent = player.hp;
  document.getElementById('w-mp').textContent = player.mp;
}

export function renderCharacter(player) {
  document.getElementById('char-level').textContent = player.level;
  document.getElementById('char-name').textContent = player.name;
  document.getElementById('char-class').textContent = player.cls;
  document.getElementById('char-str').textContent = player.str;
  document.getElementById('char-int').textContent = player.int;
  document.getElementById('char-dex').textContent = player.dex;
}

export function renderAll(player, activeTabId) {
  renderTopbar(player);
  switch (activeTabId) {
    case 'dashboard': renderDashboard(player); break;
    case 'charakter': renderCharacter(player); break;
  }
}