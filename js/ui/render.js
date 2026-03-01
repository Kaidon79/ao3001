import { formatNumber } from '../core/utils.js';

// Rendert die Topbar mit aktuellen Spielerdaten
export function renderTopbar(player) {
  const xpNeeded = player.calcXpForLevel ? player.calcXpForLevel(player.level) : 0; // später via utils
  const xpPercent = xpNeeded > 0 ? Math.min(100, (player.xp / xpNeeded) * 100) : 100;

  document.getElementById('tb-avatar').textContent = player.icon;
  document.getElementById('tb-name').textContent = player.name;
  document.getElementById('tb-class-level').textContent = `${player.cls} · Lv.${player.level}`;
  document.getElementById('tb-xp-text').textContent = `${formatNumber(player.xp)} / ${formatNumber(xpNeeded)}`;
  document.getElementById('tb-xp-fill').style.width = xpPercent + '%';
  document.getElementById('tb-gold').textContent = player.gold;
}

// Rendert das Dashboard (kann später auch in ein Modul ausgelagert werden)
export function renderDashboard(player) {
  document.getElementById('dash-greeting').textContent = `Willkommen zurück, ${player.name}.`;
  document.getElementById('w-gold').textContent = player.gold;
  document.getElementById('w-level').textContent = player.level;
  document.getElementById('w-hp').textContent = player.hp;
  document.getElementById('w-mp').textContent = player.mp;
}

// Rendert den Charakter-Tab (vorerst einfach)
export function renderCharacter(player) {
  document.getElementById('char-level').textContent = player.level;
  document.getElementById('char-name').textContent = player.name;
  document.getElementById('char-class').textContent = player.cls;
  document.getElementById('char-str').textContent = player.str;
  document.getElementById('char-int').textContent = player.int;
  document.getElementById('char-dex').textContent = player.dex;
}

// Generische Render-Funktion für alle sichtbaren Teile (Topbar + aktiver Tab)
export function renderAll(player, activeTabId) {
  renderTopbar(player);

  // Je nach aktivem Tab zusätzliche Inhalte rendern
  switch (activeTabId) {
    case 'dashboard':
      renderDashboard(player);
      break;
    case 'charakter':
      renderCharacter(player);
      break;
    // Weitere Tabs werden später durch Module ergänzt
  }
}