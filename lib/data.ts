export const TECHNOLOGIES = [
  { id: 'iot',        label: 'Internet of Things',          emoji: '📡', color: '#3B82F6' },
  { id: 'bigdata',    label: 'Big Data & Analytics',        emoji: '📊', color: '#8B5CF6' },
  { id: 'cloud',      label: 'Cloud Computing',             emoji: '☁️', color: '#06B6D4' },
  { id: 'security',   label: 'Cybersecurity',               emoji: '🔒', color: '#EF4444' },
  { id: 'arvr',       label: 'AR · VR · MR',                emoji: '🥽', color: '#F59E0B' },
  { id: 'robotics',   label: 'Robotics',                    emoji: '🤖', color: '#10B981' },
  { id: 'printing',   label: '3D Printing',                 emoji: '🖨️', color: '#F97316' },
  { id: 'integration',label: 'Cross-domain Integration',   emoji: '🔗', color: '#EC4899' },
  { id: 'simulation', label: 'Simulation',                  emoji: '🌐', color: '#6366F1' },
];

export const MYTHS = [
  {
    id: 'myth1',
    statement: '"Industry 4.0 is about robots replacing humans."',
    answer: 'MYTH',
    bust: 'Humans and machines, in conversation. Not replacement — collaboration.',
  },
  {
    id: 'myth2',
    statement: '"Industry 4.0 is only for mega factories."',
    answer: 'MYTH',
    bust: 'You can spot it in a chai tapri with a smart inventory sensor.',
  },
  {
    id: 'myth3',
    statement: '"Industry 4.0 is future stuff. Give it 5 years."',
    answer: 'MYTH',
    bust: 'Sorry — you\'re late. Check your pocket. That phone is living proof.',
  },
  {
    id: 'myth4',
    statement: '"Too complicated. Engineers only."',
    answer: 'MYTH',
    bust: 'Nine technologies, stacked together. That\'s it. You just learned them.',
  },
];

export const DESIGN_OBJECTS = [
  { id: 'key',    label: 'Metal Key',      emoji: '🔑' },
  { id: 'button', label: 'Button',         emoji: '🔘' },
  { id: 'pen',    label: 'Pen Barrel',     emoji: '✏️' },
  { id: 'bottle', label: 'Plastic Bottle', emoji: '🍶' },
];

export const STACK_SCENARIOS = [
  { id: 's1', text: 'A chai tapri wants to go smart — what do they add?' },
  { id: 's2', text: 'A village health clinic wants to serve 3× more patients — which 3 technologies help?' },
  { id: 's3', text: 'A textile MSME in Coimbatore wants to reduce waste — pick 3 technologies.' },
  { id: 's4', text: 'A delivery startup wants to build the perfect warehouse — 3 technologies, go.' },
];

export const BOT_BODIES = [
  { id: 'wheeled',   label: 'Wheeled',   emoji: '🛞' },
  { id: 'arm',       label: 'Arm',       emoji: '🦾' },
  { id: 'humanoid',  label: 'Humanoid',  emoji: '🧑‍🤖' },
  { id: 'drone',     label: 'Drone',     emoji: '🚁' },
  { id: 'box',       label: 'Smart Box', emoji: '📦' },
  { id: 'wearable',  label: 'Wearable',  emoji: '⌚' },
];

export const BOT_SUPERPOWERS = [
  { id: 'temp',     label: 'Temperature', emoji: '🌡️' },
  { id: 'location', label: 'Location',    emoji: '📍' },
  { id: 'sound',    label: 'Sound',       emoji: '🎙️' },
  { id: 'vision',   label: 'Vision',      emoji: '👁️' },
  { id: 'heart',    label: 'Heartbeat',   emoji: '❤️' },
  { id: 'air',      label: 'Air Quality', emoji: '🧪' },
  { id: 'touch',    label: 'Touch',       emoji: '🤝' },
  { id: 'power',    label: 'Power',       emoji: '⚡' },
];

export const BOT_NAMES = [
  'ARIA', 'BOLT', 'CIPHER', 'DROID', 'ECHO', 'FLUX', 'GIGA', 'HELIX',
  'IRIS', 'JUNO', 'KILO', 'LUMEN', 'MACH', 'NOVA', 'ORBIT', 'PIXEL',
  'QUBIT', 'RELAY', 'SIGMA', 'TERRA', 'ULTRA', 'VEGA', 'WARP', 'XENON',
  'YIELD', 'ZETA',
];

let botNameIndex = 0;
export function nextBotName() {
  const name = BOT_NAMES[botNameIndex % BOT_NAMES.length];
  botNameIndex++;
  return name;
}
export function resetBotNames() {
  botNameIndex = 0;
}
