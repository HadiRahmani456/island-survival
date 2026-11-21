// تمام ثابت‌های بازی اینجا
export const CONFIG = {
  GROUND_Y: 0.9,
  ISLAND_R: 24,
  EYE_H: 1.75,
  REACH: 3.5,
  MAX_DURABILITY: 20,
  ZOMBIE_HP: 8,
  MANA_DROP: 8,
  FIREBALL_COST: 20,
  WAVE_DURATION: 75,
  DAY_DURATION: 150,
};

export const WEAPONS = {
  fist:  { damage: 2, range: 2.2, cooldown: 0.48, label: 'مشت', icon: '✊' },
  sword: { damage: 4, range: 3.0, cooldown: 0.38, label: 'شمشیر', icon: '⚔️' },
  axe:   { damage: 3, range: 3.1, cooldown: 0.62, label: 'تبر', icon: '🪓' },
  bow:   { damage: 5, range: 45,  cooldown: 0.78, label: 'کمان', icon: '🏹' },
};