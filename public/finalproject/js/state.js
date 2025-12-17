export const RunState = {
  level: 1,
  score: 0,
  hp: 100,
  maxHp: 100,
  upgrades: [],
  weapon: {
    damage: 10,
    fireRateMs: 250,
    projectiles: 1,
    projectileSpeed: 720
  }
};

export function saveRunState() {
  sessionStorage.setItem("runState", JSON.stringify(RunState));
}

export function loadRunState() {
  const raw = sessionStorage.getItem("runState");
  if (!raw) return;
  try {
    Object.assign(RunState, JSON.parse(raw));
  } catch {
    // If corrupted, start fresh.
    sessionStorage.removeItem("runState");
  }
}

export function clearRunState() {
  sessionStorage.removeItem("runState");
}
