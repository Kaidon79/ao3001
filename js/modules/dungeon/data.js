// Daten für Dungeons
export const dungeons = [
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