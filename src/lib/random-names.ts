const prefixes = [
  'Shadow', 'Iron', 'Storm', 'Dark', 'Silver', 'Frost', 'Ember', 'Stone',
  'Thorn', 'Blood', 'Star', 'Moon', 'Sun', 'Night', 'Ash', 'Crystal',
  'Wind', 'Fire', 'Thunder', 'Gold', 'Raven', 'Wolf', 'Bear', 'Hawk',
  'Bone', 'Mist', 'Dusk', 'Dawn', 'Flame', 'Steel',
];

const suffixes = [
  'bane', 'forge', 'wood', 'blade', 'heart', 'claw', 'fang', 'song',
  'weaver', 'walker', 'fall', 'thorn', 'shade', 'born', 'wind', 'fire',
  'strike', 'guard', 'vale', 'stone', 'brook', 'ridge', 'mane', 'spark',
  'whisk', 'lock', 'helm', 'ward', 'root', 'scale', 'brow', 'run', 'keep',
];

const standalones = [
  'Aldric', 'Brynn', 'Cassian', 'Dael', 'Elara', 'Fenris', 'Gideon',
  'Hesper', 'Isolde', 'Jareth', 'Kael', 'Lyra', 'Mordecai', 'Nyx',
  'Orion', 'Petra', 'Quinn', 'Ronan', 'Sable', 'Theron', 'Ulric',
  'Vesper', 'Wren', 'Xara', 'Yael', 'Zephyr', 'Orin', 'Mira', 'Talon',
  'Sera', 'Rook', 'Kira', 'Draven', 'Ember', 'Vex', 'Cael',
];

const titles = [
  'the Brave', 'the Wise', 'the Bold', 'the Swift', 'the Silent',
  'the Keen', 'the Old', 'the Young', 'the Lost', 'the Grey',
  'the Red', 'the Dark',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomName(): string {
  const useCompound = Math.random() < 0.5;
  let name: string;

  if (useCompound) {
    name = pick(prefixes) + pick(suffixes);
  } else {
    name = pick(standalones);
  }

  if (Math.random() < 0.2) {
    name += ' ' + pick(titles);
  }

  return name;
}
