// Rendert die Dungeon-Auswahlliste
export function renderDungeonList(dungeons, playerLevel, onSelect) {
  let html = '<div class="page-title">Dungeon-Auswahl</div>';
  html += '<div class="dungeon-list">';
  
  dungeons.forEach(d => {
    const disabled = playerLevel < d.minLevel ? 'disabled' : '';
    html += `
      <div class="dungeon-card ${disabled}" onclick="(${onSelect})('${d.id}')">
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
  return html;
}

// Rendert die Kampfansicht
export function renderCombat(dungeon, room, enemy, player, logEntries) {
  const playerHpPercent = (player.hp / player.hpMax) * 100;
  const enemyHpPercent = (enemy.hp / enemy.hpMax) * 100;
  
  let html = `
    <div class="page-title">${dungeon.name}</div>
    <div class="page-sub">Raum ${room + 1} / ${dungeon.rooms + 1}</div>
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
        ${logEntries.map(entry => `<div class="combat-log-entry">${entry.message}</div>`).join('')}
      </div>
      <div class="combat-actions">
        <button class="btn-combat primary" onclick="DungeonModule.playerAction('attack')">⚔️ Angreifen</button>
        <button class="btn-combat" onclick="DungeonModule.playerAction('defend')">🛡️ Verteidigen</button>
        <button class="btn-combat" onclick="DungeonModule.playerAction('flee')">🏃 Fliehen</button>
      </div>
    </div>
  `;
  return html;
}

// Rendert das Ergebnis (Sieg/Niederlage)
export function renderResult(success) {
  const icon = success ? '🏆' : '💔';
  const title = success ? 'Dungeon abgeschlossen!' : 'Du wurdest besiegt...';
  const text = success ? 'Kehre zur Auswahl zurück oder betrete einen neuen Dungeon.' : 'Versuche es erneut oder wähle einen anderen Dungeon.';
  
  return `
    <div class="combat-result">
      <div class="coming-soon-icon">${icon}</div>
      <div class="coming-soon-title">${title}</div>
      <div class="coming-soon-sub">${text}</div>
      <button class="btn-combat primary" onclick="DungeonModule.backToSelection()" style="margin-top:20px;">← Zurück zur Auswahl</button>
    </div>
  `;
}