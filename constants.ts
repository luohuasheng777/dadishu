
export const GRID_ROWS = 5;
export const GRID_COLS = 3;
export const TOTAL_HOLES = GRID_ROWS * GRID_COLS;

export const INITIAL_HP = 5.0;
export const HP_PENALTY_MISS = 0.5; // "1/2 point"
export const HP_PENALTY_PANDA = 0; // Penalty is score only for panda in description, but usually bad clicks don't hurt HP unless specified. Prompt says "Panda -5 points", doesn't mention HP. Missed Mole/Fox = -0.5 HP.

export const SCORE_MOLE = 5;
export const SCORE_FOX = 10;
export const SCORE_PANDA = -5;

export const INITIAL_SPAWN_INTERVAL = 5000; // Legacy interval, mostly replaced by wave logic now
export const INITIAL_STAY_DURATION = 4000; // ms - Updated to 4 seconds
export const MIN_SPAWN_INTERVAL = 600;
export const MIN_STAY_DURATION = 2000; // ms - Minimum limit per request

// New Spawn Count Constants
export const INITIAL_SPAWN_COUNT = 2;
export const MAX_SPAWN_COUNT = 6;

// Game ramps up difficulty every X seconds
export const DIFFICULTY_RAMP_INTERVAL = 5000; 

export const STORAGE_KEY = 'ranch-whack-a-mole-data';
