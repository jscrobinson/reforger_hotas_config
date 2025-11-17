export type FilterPreset =
  | 'pressed'
  | 'previous'
  | 'next'
  | 'click'
  | 'hold'
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'forward'
  | 'back'
  | 'toggle'
  | 'select';

export type HardwareType =
  | 'button'
  | 'trigger'
  | 'stick'
  | 'throttle'
  | 'pedals'
  | 'hat'
  | 'switch';

export type ImportanceLevel = 'critical' | 'important' | 'optional';

export interface Action {
  name: string;
  filterPreset: FilterPreset;
  hint: string;
  hardware: HardwareType;
  importance: ImportanceLevel;
  binding: string | null;
}

export interface ConnectedGamepad {
  id: string;
  index: number;
}

export interface GamepadState {
  buttons: { pressed: boolean }[];
  axes: number[];
}

export interface AppState {
  actions: Action[];
  currentActionIndex: number;
  furthestActionIndex: number;
  configuring: boolean;
  connectedGamepads: Record<number, ConnectedGamepad>;
  previousGamepadState: Record<number, GamepadState>;
  baselineGamepadState: Record<number, GamepadState>;
  filter: 'all' | 'configured' | 'unconfigured';
  inputCooldown: boolean;
  pendingInput: string | null;
}
