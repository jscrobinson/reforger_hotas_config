<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Action, AppState, GamepadState } from './types'

// Google Analytics gtag declaration
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void
  }
}

// Action definitions with sensible FilterPreset defaults and hints
const ACTIONS: Omit<Action, 'bindings'>[] = [
  { name: 'HelicopterCollectiveIncrease', filterPreset: 'up', hint: 'Increase altitude (raise collective)', hardware: 'throttle', importance: 'critical' },
  { name: 'HelicopterCollectiveDecrease', filterPreset: 'down', hint: 'Decrease altitude (lower collective)', hardware: 'throttle', importance: 'critical' },
  { name: 'HelicopterAntiTorqueLeft', filterPreset: 'left', hint: 'Yaw left (left pedal)', hardware: 'pedals', importance: 'critical' },
  { name: 'HelicopterAntiTorqueRight', filterPreset: 'right', hint: 'Yaw right (right pedal)', hardware: 'pedals', importance: 'critical' },
  { name: 'HelicopterCyclicForward', filterPreset: 'forward', hint: 'Pitch nose down (move forward)', hardware: 'stick', importance: 'critical' },
  { name: 'HelicopterCyclicBack', filterPreset: 'back', hint: 'Pitch nose up (slow down)', hardware: 'stick', importance: 'critical' },
  { name: 'HelicopterCyclicLeft', filterPreset: 'left', hint: 'Roll left (move sideways left)', hardware: 'stick', importance: 'critical' },
  { name: 'HelicopterCyclicRight', filterPreset: 'right', hint: 'Roll right (move sideways right)', hardware: 'stick', importance: 'critical' },
  { name: 'HelicopterWheelBrake', filterPreset: 'pressed', hint: 'Apply brakes (momentary)', hardware: 'pedals', importance: 'important' },
  { name: 'HelicopterWheelBrakePersistent', filterPreset: 'pressed', hint: 'Parking brake (toggle)', hardware: 'button', importance: 'important' },
  { name: 'HelicopterAutohoverToggle', filterPreset: 'click', hint: 'Auto-hover stabilization', hardware: 'button', importance: 'important' },
  { name: 'HelicopterLightsTaxiToggle', filterPreset: 'toggle', hint: 'Taxi lights (ground operations)', hardware: 'switch', importance: 'optional' },
  { name: 'HelicopterLightsLandingToggle', filterPreset: 'toggle', hint: 'Landing lights (approach)', hardware: 'switch', importance: 'optional' },
  { name: 'HelicopterEngineStart', filterPreset: 'hold', hint: 'Start engine and rotors', hardware: 'button', importance: 'critical' },
  { name: 'HelicopterEngineStop', filterPreset: 'click', hint: 'Stop engine and rotors', hardware: 'button', importance: 'critical' },
  { name: 'CharacterFire', filterPreset: 'hold', hint: 'Fire primary weapon (use same trigger as all fire actions)', hardware: 'trigger', importance: 'critical' },
  { name: 'CharacterNextWeapon', filterPreset: 'click', hint: 'Switch to next weapon (use same button as all weapon switch actions)', hardware: 'hat', importance: 'important' },
  { name: 'CharacterNextFireMode', filterPreset: 'click', hint: 'Change fire mode (single/burst/auto)', hardware: 'button', importance: 'important' },
  { name: 'CharacterNextMuzzle', filterPreset: 'click', hint: 'Switch muzzle attachment or barrel', hardware: 'button', importance: 'optional' },
  { name: 'TurretFire', filterPreset: 'hold', hint: 'Fire turret weapon (use same trigger as all fire actions)', hardware: 'trigger', importance: 'important' },
  { name: 'TurretReload', filterPreset: 'click', hint: 'Reload turret weapon', hardware: 'button', importance: 'important' },
  { name: 'TurretNextWeapon', filterPreset: 'click', hint: 'Cycle turret weapons (use same button as all weapon switch actions)', hardware: 'hat', importance: 'important' },
  { name: 'TurretNextFireMode', filterPreset: 'click', hint: 'Change turret fire mode', hardware: 'button', importance: 'optional' },
  { name: 'TurretADS', filterPreset: 'click', hint: 'Aim down sights (toggle)', hardware: 'button', importance: 'optional' },
  { name: 'TurretADSHold', filterPreset: 'hold', hint: 'Aim down sights (hold)', hardware: 'button', importance: 'optional' },
  { name: 'TurretRotateLeft', filterPreset: 'left', hint: 'Rotate turret left', hardware: 'stick', importance: 'important' },
  { name: 'TurretRotateRight', filterPreset: 'right', hint: 'Rotate turret right', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimUp', filterPreset: 'up', hint: 'Elevate turret up', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimDown', filterPreset: 'down', hint: 'Depress turret down', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimLeft', filterPreset: 'left', hint: 'Fine aim left', hardware: 'stick', importance: 'optional' },
  { name: 'TurretAimRight', filterPreset: 'right', hint: 'Fine aim right', hardware: 'stick', importance: 'optional' },
  { name: 'HelicopterFire', filterPreset: 'hold', hint: 'Fire heli weapon (use same trigger as all fire actions)', hardware: 'trigger', importance: 'important' },
  { name: 'VehicleFire', filterPreset: 'hold', hint: 'Fire vehicle weapon (use same trigger as all fire actions)', hardware: 'trigger', importance: 'important' },
  { name: 'WeaponToggleSightsIllumination', filterPreset: 'click', hint: 'Toggle reticle illumination', hardware: 'button', importance: 'optional' },
  { name: 'WeaponSwitchOptics', filterPreset: 'click', hint: 'Change zoom/magnification', hardware: 'button', importance: 'important' },
  { name: 'FocusToggle', filterPreset: 'click', hint: 'Toggle focused aim/scope', hardware: 'button', importance: 'optional' },
  { name: 'Freelook', filterPreset: 'hold', hint: 'Hold to look around freely', hardware: 'button', importance: 'important' },
  { name: 'FreelookReset', filterPreset: 'click', hint: 'Reset view to center', hardware: 'button', importance: 'optional' },
  { name: 'FreelookUp', filterPreset: 'up', hint: 'Look up', hardware: 'hat', importance: 'optional' },
  { name: 'FreelookDown', filterPreset: 'down', hint: 'Look down', hardware: 'hat', importance: 'optional' },
  { name: 'FreelookLeft', filterPreset: 'left', hint: 'Look left', hardware: 'hat', importance: 'optional' },
  { name: 'FreelookRight', filterPreset: 'right', hint: 'Look right', hardware: 'hat', importance: 'optional' },
  { name: 'VONDirectToggle', filterPreset: 'click', hint: 'Toggle voice chat (push-to-talk)', hardware: 'button', importance: 'important' },
  { name: 'VONChannel', filterPreset: 'hold', hint: 'Hold to talk on radio channel', hardware: 'button', importance: 'important' },
  { name: 'GadgetMap', filterPreset: 'select', hint: 'Open/close map', hardware: 'button', importance: 'important' },
  { name: 'PerformAction', filterPreset: 'pressed', hint: 'Context action (interact, reload, etc.)', hardware: 'button', importance: 'important' },
  { name: 'SelectAction', filterPreset: 'previous', hint: 'Cycle through available actions', hardware: 'button', importance: 'optional' },
  { name: 'GetOut', filterPreset: 'click', hint: 'Exit vehicle safely', hardware: 'button', importance: 'important' },
  { name: 'JumpOut', filterPreset: 'click', hint: 'Emergency eject (dangerous!)', hardware: 'button', importance: 'optional' }
]

// WCS Armament actions (optional mod support)
const WCS_ACTIONS: Omit<Action, 'bindings'>[] = [
  { name: 'WCS_Armament_CycleWeapon', filterPreset: 'click', hint: 'Cycle to next weapon (pilot/vehicle weapons)', hardware: 'button', importance: 'important' },
  { name: 'WCS_Armament_DeployFlares', filterPreset: 'hold', hint: 'Deploy flares (countermeasure)', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_DeployChaffs', filterPreset: 'hold', hint: 'Deploy chaff (countermeasure)', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_TurretStabilizationToggle', filterPreset: 'click', hint: 'Toggle turret stabilization', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_VehicleAim', filterPreset: 'hold', hint: 'Vehicle aim mode', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_CycleWeaponFireMode', filterPreset: 'click', hint: 'Cycle weapon fire mode', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_ActivateLock', filterPreset: 'hold', hint: 'Activate weapon lock', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_DeploySmoke', filterPreset: 'hold', hint: 'Deploy smoke (countermeasure)', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_RadarToggle', filterPreset: 'click', hint: 'Toggle radar', hardware: 'button', importance: 'optional' },
  { name: 'WCS_Armament_FireContinuousSmokeDispenser', filterPreset: 'hold', hint: 'Fire continuous smoke dispenser', hardware: 'button', importance: 'optional' },
  { name: 'TurretWeaponNextRippleQuantity', filterPreset: 'click', hint: 'Cycle weapon ripple quantity', hardware: 'button', importance: 'optional' }
]

// Axis calibration data
interface AxisCalibrationData {
  min: number
  max: number
  center: number
}

interface AxisCalibration {
  [gamepadIndex: number]: {
    [axisIndex: number]: AxisCalibrationData
  }
}

// State
const state = reactive<AppState>({
  actions: ACTIONS.map(action => ({ ...action, bindings: [] })),
  currentActionIndex: -1,
  furthestActionIndex: -1,
  configuring: false,
  connectedGamepads: {},
  previousGamepadState: {},
  baselineGamepadState: {},
  filter: 'all',
  inputCooldown: false,
  pendingInput: null
})

const axisCalibration = reactive<AxisCalibration>({})

const hatModeEnabled = ref(false)
const calibrationModeEnabled = ref(false)
const autoProgressEnabled = ref(true) // Auto-advance to next action after confirming binding
const wcsActionsEnabled = ref(false) // Include WCS Armament mod actions

// Test mode state
const testModeEnabled = ref(false)
const testModeInput = ref<string | null>(null)
const testModeMatchingActions = ref<Action[]>([])

// Watch for WCS actions toggle and rebuild actions list
watch(wcsActionsEnabled, (enabled) => {
  const baseActions = ACTIONS.map(action => ({ ...action, bindings: [] as string[] }))
  const wcsActions = WCS_ACTIONS.map(action => ({ ...action, bindings: [] as string[] }))

  // Preserve existing bindings where possible
  const existingBindings = new Map(state.actions.map(a => [a.name, a.bindings]))

  const newActions = enabled ? [...baseActions, ...wcsActions] : baseActions
  newActions.forEach(action => {
    const existing = existingBindings.get(action.name)
    if (existing) {
      action.bindings = existing
    }
  })

  state.actions = newActions

  // Reset current action index if it's out of bounds
  if (state.currentActionIndex >= state.actions.length) {
    state.currentActionIndex = state.actions.length - 1
  }
  if (state.furthestActionIndex >= state.actions.length) {
    state.furthestActionIndex = state.actions.length - 1
  }
})

// Cookie consent state
const showCookieConsent = ref(false)

// Visualization data for all connected gamepads
interface GamepadVisualization {
  index: number
  name: string
  axes: number[]
  buttons: boolean[]
}

const gamepadVisualizations = ref<GamepadVisualization[]>([])

// Git commit hash injected at build time
const gitHash = __GIT_HASH__

// Computed
const filteredActions = computed(() => {
  return state.actions.filter(action => {
    if (state.filter === 'configured') return action.bindings.length > 0
    if (state.filter === 'unconfigured') return action.bindings.length === 0
    return true
  })
})

const configuredCount = computed(() => state.actions.filter(a => a.bindings.length > 0).length)
const unconfiguredCount = computed(() => state.actions.length - configuredCount.value)
const progressPercentage = computed(() => (configuredCount.value / state.actions.length) * 100)

const currentAction = computed(() => {
  if (state.currentActionIndex >= 0 && state.currentActionIndex < state.actions.length) {
    return state.actions[state.currentActionIndex]
  }
  return null
})

const showResumeButton = computed(() => {
  if (state.currentActionIndex < state.furthestActionIndex) {
    let resumeIndex = state.furthestActionIndex
    while (resumeIndex < state.actions.length && state.actions[resumeIndex].bindings.length > 0) {
      resumeIndex++
    }
    return resumeIndex < state.actions.length
  }
  return false
})

const resumeActionNumber = computed(() => {
  let resumeIndex = state.furthestActionIndex
  while (resumeIndex < state.actions.length && state.actions[resumeIndex].bindings.length > 0) {
    resumeIndex++
  }
  return resumeIndex + 1
})

const isConfigurationComplete = computed(() => {
  return configuredCount.value === state.actions.length && configuredCount.value > 0
})

// Fire action helpers
const FIRE_ACTION_NAMES = ['CharacterFire', 'TurretFire', 'HelicopterFire', 'VehicleFire']

// Weapon switching action helpers
const WEAPON_SWITCH_ACTION_NAMES = ['CharacterNextWeapon', 'TurretNextWeapon']

const isCurrentActionFireAction = computed(() => {
  if (!currentAction.value) return false
  return FIRE_ACTION_NAMES.includes(currentAction.value.name)
})

const configuredFireActions = computed(() => {
  return state.actions.filter(action =>
    FIRE_ACTION_NAMES.includes(action.name) && action.bindings.length > 0
  )
})

const firstConfiguredFireAction = computed(() => {
  return configuredFireActions.value.length > 0 ? configuredFireActions.value[0] : null
})

// Weapon switching computed properties
const isCurrentActionWeaponSwitch = computed(() => {
  if (!currentAction.value) return false
  return WEAPON_SWITCH_ACTION_NAMES.includes(currentAction.value.name)
})

const configuredWeaponSwitchActions = computed(() => {
  return state.actions.filter(action =>
    WEAPON_SWITCH_ACTION_NAMES.includes(action.name) && action.bindings.length > 0
  )
})

const firstConfiguredWeaponSwitchAction = computed(() => {
  return configuredWeaponSwitchActions.value.length > 0 ? configuredWeaponSwitchActions.value[0] : null
})

// Methods
function formatActionName(name: string): string {
  // Strip WCS_Armament_ prefix for cleaner display
  const cleanName = name.replace(/^WCS_Armament_/, '')
  return cleanName.replace(/_/g, "").replace(/([A-Z]([^A-Z]))/g, ' $1').trim()
}

// Utility function to describe input in human-readable form (currently unused but kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function describeInput(input: string): string {
  const match = input.match(/joystick(\d+):(button|axis)(\d+)([\+\-])?/)
  if (!match) return input

  const [, joyNum, type, num, direction] = match

  if (type === 'button') {
    return `Joystick ${joyNum}, Button ${num}`
  } else {
    const dir = direction === '+' ? 'positive' : 'negative'
    return `Joystick ${joyNum}, Axis ${num} ${dir} (${direction === '+' ? 'push/right' : 'pull/left'})`
  }
}

function resetGamepadBaseline() {
  const gamepads = navigator.getGamepads()
  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i]
    if (gamepad) {
      const stateSnapshot: GamepadState = {
        buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
        axes: [...gamepad.axes]
      }
      state.previousGamepadState[i] = { ...stateSnapshot }
      state.baselineGamepadState[i] = { ...stateSnapshot }
    }
  }
}

// Axis calibration functions
function updateAxisCalibration(gamepadIndex: number, axisIndex: number, value: number) {
  // Only track calibration if calibration mode is enabled
  if (!calibrationModeEnabled.value) return

  if (!axisCalibration[gamepadIndex]) {
    axisCalibration[gamepadIndex] = {}
  }

  if (!axisCalibration[gamepadIndex][axisIndex]) {
    axisCalibration[gamepadIndex][axisIndex] = {
      min: value,
      max: value,
      center: value
    }
  } else {
    const calibData = axisCalibration[gamepadIndex][axisIndex]
    calibData.min = Math.min(calibData.min, value)
    calibData.max = Math.max(calibData.max, value)
    calibData.center = (calibData.min + calibData.max) / 2
  }
}

function normalizeAxisValue(gamepadIndex: number, axisIndex: number, value: number): number {
  // Only apply normalization if calibration mode is enabled
  if (!calibrationModeEnabled.value) {
    return value
  }

  const calibData = axisCalibration[gamepadIndex]?.[axisIndex]

  if (!calibData) {
    return value
  }

  const { min, max, center } = calibData
  const range = max - min

  if (range < 0.1) {
    return 0
  }

  if (value < center) {
    const leftRange = center - min
    if (leftRange < 0.01) return 0
    return -1 * (center - value) / leftRange
  } else {
    const rightRange = max - center
    if (rightRange < 0.01) return 0
    return (value - center) / rightRange
  }
}

function startConfiguration() {
  state.configuring = true
  state.currentActionIndex = 0
  state.furthestActionIndex = 0
  state.inputCooldown = false
  resetGamepadBaseline()

  // Track Start Configuring event with connected joysticks
  const joysticks = Object.values(state.connectedGamepads)
  const joystickTypes = joysticks.map(j => j.id).join(', ') || 'None'

  if (window.gtag) {
    window.gtag('event', 'start_configuration', {
      joystick_count: joysticks.length,
      joystick_types: joystickTypes,
      event_category: 'engagement'
    })
  }
}

function skipCurrentAction() {
  state.inputCooldown = false
  state.pendingInput = null
  resetGamepadBaseline()
  nextAction()
}

function clearCurrentActionBinding() {
  if (currentAction.value) {
    currentAction.value.bindings = []
    state.pendingInput = null
    state.inputCooldown = false
    resetGamepadBaseline()
  }
}

function copyFireActionBinding() {
  if (currentAction.value && firstConfiguredFireAction.value) {
    currentAction.value.bindings = [...firstConfiguredFireAction.value.bindings]
    state.pendingInput = null
    state.inputCooldown = true
    setTimeout(() => {
      state.inputCooldown = false
      resetGamepadBaseline()
      nextAction()
    }, 300)
  }
}

function copyWeaponSwitchBinding() {
  if (currentAction.value && firstConfiguredWeaponSwitchAction.value) {
    currentAction.value.bindings = [...firstConfiguredWeaponSwitchAction.value.bindings]
    state.pendingInput = null
    state.inputCooldown = true
    setTimeout(() => {
      state.inputCooldown = false
      resetGamepadBaseline()
      nextAction()
    }, 300)
  }
}

function nextAction() {
  state.pendingInput = null

  let nextIndex = state.currentActionIndex + 1
  while (nextIndex < state.actions.length && state.actions[nextIndex].bindings.length > 0) {
    nextIndex++
  }

  if (nextIndex < state.actions.length) {
    state.currentActionIndex = nextIndex
    if (state.currentActionIndex > state.furthestActionIndex) {
      state.furthestActionIndex = state.currentActionIndex
    }
  } else {
    finishConfiguration()
  }
}

function navigateToPreviousAction() {
  if (state.currentActionIndex > 0) {
    state.pendingInput = null
    state.currentActionIndex--
    resetGamepadBaseline()
  }
}

function navigateToNextAction() {
  if (state.currentActionIndex < state.actions.length - 1) {
    state.pendingInput = null
    state.currentActionIndex++
    if (state.currentActionIndex > state.furthestActionIndex) {
      state.furthestActionIndex = state.currentActionIndex
    }
    resetGamepadBaseline()
  }
}

function jumpToAction(index: number) {
  if (index >= 0 && index < state.actions.length) {
    state.pendingInput = null
    state.currentActionIndex = index
    if (state.currentActionIndex > state.furthestActionIndex) {
      state.furthestActionIndex = state.currentActionIndex
    }
    resetGamepadBaseline()
  }
}

function resumeConfiguration() {
  let nextIndex = state.furthestActionIndex
  while (nextIndex < state.actions.length && state.actions[nextIndex].bindings.length > 0) {
    nextIndex++
  }
  if (nextIndex < state.actions.length) {
    jumpToAction(nextIndex)
  }
}

function finishConfiguration() {
  state.configuring = false
  state.currentActionIndex = -1
}

// Test mode functions
function findActionsByInput(input: string): Action[] {
  return state.actions.filter(action => action.bindings.includes(input))
}

function startTestMode() {
  testModeEnabled.value = true
  testModeInput.value = null
  testModeMatchingActions.value = []
  state.inputCooldown = false
  resetGamepadBaseline()
}

function exitTestMode() {
  testModeEnabled.value = false
  testModeInput.value = null
  testModeMatchingActions.value = []
}

function handleTestModeInput(input: string) {
  testModeInput.value = input
  testModeMatchingActions.value = findActionsByInput(input)
}

function detectTestModeInput(gamepad: Gamepad, gamepadIndex: number) {
  if (state.inputCooldown) return

  if (!state.previousGamepadState[gamepadIndex]) {
    state.previousGamepadState[gamepadIndex] = {
      buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
      axes: [...gamepad.axes]
    }
    return
  }

  const prevState = state.previousGamepadState[gamepadIndex]

  // Check buttons
  for (let i = 0; i < gamepad.buttons.length; i++) {
    const button = gamepad.buttons[i]
    const prevButton = prevState.buttons[i] || { pressed: false }
    if (button.pressed && !prevButton.pressed) {
      handleTestModeInput(`joystick${gamepadIndex}:button${i}`)
      state.inputCooldown = true
      setTimeout(() => {
        state.inputCooldown = false
      }, 200)
      return
    }
  }

  // Check axes
  const AXIS_THRESHOLD = 0.75
  const HAT_THRESHOLD = 0.5
  const FRAME_DELTA_THRESHOLD = 0.3
  const TOTAL_MOVEMENT_THRESHOLD = 0.5

  const baselineState = state.baselineGamepadState[gamepadIndex]

  for (let i = 0; i < gamepad.axes.length; i++) {
    const rawAxisValue = gamepad.axes[i]
    const axisValue = normalizeAxisValue(gamepadIndex, i, rawAxisValue)

    const prevRawAxisValue = prevState.axes[i] !== undefined ? prevState.axes[i] : rawAxisValue
    const prevAxisValue = normalizeAxisValue(gamepadIndex, i, prevRawAxisValue)

    const baselineRawAxisValue = baselineState?.axes[i] !== undefined ? baselineState.axes[i] : rawAxisValue
    const baselineAxisValue = normalizeAxisValue(gamepadIndex, i, baselineRawAxisValue)

    const frameDelta = Math.abs(axisValue - prevAxisValue)
    const totalMovement = Math.abs(axisValue - baselineAxisValue)

    // HAT MODE
    if (hatModeEnabled.value) {
      if (frameDelta > 0.25) {
        if (Math.abs(axisValue) > 0.3) {
          const direction = axisValue > 0 ? '+' : '-'
          handleTestModeInput(`joystick${gamepadIndex}:axis${i}${direction}`)
          state.inputCooldown = true
          setTimeout(() => {
            state.inputCooldown = false
          }, 200)
          return
        }
      }
    }

    // Hat switch detection
    const isNearDiscrete = Math.abs(Math.abs(axisValue) - 1.0) < 0.15 || Math.abs(axisValue) < 0.15
    const nowAtExtreme = Math.abs(axisValue) > HAT_THRESHOLD

    if (frameDelta > FRAME_DELTA_THRESHOLD && isNearDiscrete && nowAtExtreme) {
      let direction: string | undefined
      if (axisValue < -HAT_THRESHOLD) {
        direction = '-'
      } else if (axisValue > HAT_THRESHOLD) {
        direction = '+'
      }
      if (direction) {
        handleTestModeInput(`joystick${gamepadIndex}:axis${i}${direction}`)
        state.inputCooldown = true
        setTimeout(() => {
          state.inputCooldown = false
        }, 200)
        return
      }
    }

    // Regular analog axis detection
    if (totalMovement > TOTAL_MOVEMENT_THRESHOLD && !isNearDiscrete) {
      if (axisValue > AXIS_THRESHOLD) {
        handleTestModeInput(`joystick${gamepadIndex}:axis${i}+`)
        state.inputCooldown = true
        setTimeout(() => {
          state.inputCooldown = false
        }, 200)
        return
      } else if (axisValue < -AXIS_THRESHOLD) {
        handleTestModeInput(`joystick${gamepadIndex}:axis${i}-`)
        state.inputCooldown = true
        setTimeout(() => {
          state.inputCooldown = false
        }, 200)
        return
      }
    }
  }

  state.previousGamepadState[gamepadIndex] = {
    buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
    axes: [...gamepad.axes]
  }
}

function confirmInput() {
  if (state.pendingInput && currentAction.value) {
    // Add the new binding to the array if it doesn't already exist
    if (!currentAction.value.bindings.includes(state.pendingInput)) {
      currentAction.value.bindings.push(state.pendingInput)
    }
    state.pendingInput = null
    state.inputCooldown = true
    setTimeout(() => {
      state.inputCooldown = false
      resetGamepadBaseline()
      // Auto-advance to next action if enabled
      if (autoProgressEnabled.value) {
        nextAction()
      }
    }, 300)
  }
}

function removeBinding(index: number) {
  if (currentAction.value && index >= 0 && index < currentAction.value.bindings.length) {
    currentAction.value.bindings.splice(index, 1)
  }
}

function assignInput(input: string) {
  if (currentAction.value) {
    state.pendingInput = input
    state.inputCooldown = true
    setTimeout(() => {
      state.inputCooldown = false
    }, 300)
  }
}

function detectInput(gamepad: Gamepad, gamepadIndex: number) {
  if (state.inputCooldown) return

  if (!state.previousGamepadState[gamepadIndex]) {
    state.previousGamepadState[gamepadIndex] = {
      buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
      axes: [...gamepad.axes]
    }
    return
  }

  const prevState = state.previousGamepadState[gamepadIndex]

  // Check buttons
  for (let i = 0; i < gamepad.buttons.length; i++) {
    const button = gamepad.buttons[i]
    const prevButton = prevState.buttons[i] || { pressed: false }
    if (button.pressed && !prevButton.pressed) {
      assignInput(`joystick${gamepadIndex}:button${i}`)
      return
    }
  }

  // Check axes
  const AXIS_THRESHOLD = 0.75
  const HAT_THRESHOLD = 0.5
  const FRAME_DELTA_THRESHOLD = 0.3
  const TOTAL_MOVEMENT_THRESHOLD = 0.5

  const baselineState = state.baselineGamepadState[gamepadIndex]

  for (let i = 0; i < gamepad.axes.length; i++) {
    const rawAxisValue = gamepad.axes[i]
    const axisValue = normalizeAxisValue(gamepadIndex, i, rawAxisValue)

    const prevRawAxisValue = prevState.axes[i] !== undefined ? prevState.axes[i] : rawAxisValue
    const prevAxisValue = normalizeAxisValue(gamepadIndex, i, prevRawAxisValue)

    const baselineRawAxisValue = baselineState?.axes[i] !== undefined ? baselineState.axes[i] : rawAxisValue
    const baselineAxisValue = normalizeAxisValue(gamepadIndex, i, baselineRawAxisValue)

    const frameDelta = Math.abs(axisValue - prevAxisValue)
    const totalMovement = Math.abs(axisValue - baselineAxisValue)

    // HAT MODE
    if (hatModeEnabled.value) {
      if (frameDelta > 0.25) {
        if (Math.abs(axisValue) > 0.3) {
          const direction = axisValue > 0 ? '+' : '-'
          assignInput(`joystick${gamepadIndex}:axis${i}${direction}`)
          return
        }
      }
    }

    // Hat switch detection
    const isNearDiscrete = Math.abs(Math.abs(axisValue) - 1.0) < 0.15 || Math.abs(axisValue) < 0.15
    const nowAtExtreme = Math.abs(axisValue) > HAT_THRESHOLD

    if (frameDelta > FRAME_DELTA_THRESHOLD && isNearDiscrete && nowAtExtreme) {
      let direction: string | undefined
      if (axisValue < -HAT_THRESHOLD) {
        direction = '-'
      } else if (axisValue > HAT_THRESHOLD) {
        direction = '+'
      }
      if (direction) {
        assignInput(`joystick${gamepadIndex}:axis${i}${direction}`)
        return
      }
    }

    // Regular analog axis detection
    if (totalMovement > TOTAL_MOVEMENT_THRESHOLD && !isNearDiscrete) {
      if (axisValue > AXIS_THRESHOLD) {
        assignInput(`joystick${gamepadIndex}:axis${i}+`)
        return
      } else if (axisValue < -AXIS_THRESHOLD) {
        assignInput(`joystick${gamepadIndex}:axis${i}-`)
        return
      }
    }
  }

  state.previousGamepadState[gamepadIndex] = {
    buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
    axes: [...gamepad.axes]
  }
}

function updateVisualizations(gamepads: (Gamepad | null)[]) {
  const visualizations: GamepadVisualization[] = []

  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i]
    if (gamepad) {
      visualizations.push({
        index: gamepad.index,
        name: gamepad.id,
        axes: gamepad.axes.map((rawValue, axisIndex) =>
          normalizeAxisValue(gamepad.index, axisIndex, rawValue)
        ),
        buttons: gamepad.buttons.map(b => b.pressed)
      })
    }
  }

  gamepadVisualizations.value = visualizations
}

let animationFrameId: number | null = null

function pollGamepads() {
  const gamepads = navigator.getGamepads()
  let hasGamepads = false

  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i]
    if (gamepad) {
      hasGamepads = true

      if (!state.connectedGamepads[i]) {
        state.connectedGamepads[i] = {
          id: gamepad.id,
          index: i
        }
      }

      // Update calibration data for all axes (always, even when not configuring)
      for (let axisIndex = 0; axisIndex < gamepad.axes.length; axisIndex++) {
        updateAxisCalibration(i, axisIndex, gamepad.axes[axisIndex])
      }

      if (state.configuring && state.currentActionIndex >= 0) {
        detectInput(gamepad, i)
      }

      // Test mode input detection
      if (testModeEnabled.value) {
        detectTestModeInput(gamepad, i)
      }
    }
  }

  if (!hasGamepads && Object.keys(state.connectedGamepads).length > 0) {
    state.connectedGamepads = {}
  }

  // Update visualizations for all connected gamepads
  updateVisualizations(gamepads)

  animationFrameId = requestAnimationFrame(pollGamepads)
}

function handleKeyDown(event: KeyboardEvent) {
  if (!state.configuring) return

  if (event.code === 'Space' || event.key === ' ') {
    if (state.pendingInput) {
      event.preventDefault()
      confirmInput()
    }
  } else if (event.code === 'ArrowUp' || event.key === 'ArrowUp') {
    event.preventDefault()
    navigateToPreviousAction()
  } else if (event.code === 'ArrowDown' || event.key === 'ArrowDown') {
    event.preventDefault()
    navigateToNextAction()
  }
}

function generateGUID(): string {
  // Generate 16 character alphanumeric (hex) value
  let result = ''
  const hexChars = '0123456789ABCDEF'
  for (let i = 0; i < 16; i++) {
    result += hexChars.charAt(Math.floor(Math.random() * 16))
  }
  return result
}

// Helper function to track config download
function trackConfigDownload() {
  const joysticks = Object.values(state.connectedGamepads)
  const joystickTypes = joysticks.map(j => j.id).join(', ') || 'None'
  const configuredActionsCount = state.actions.filter(a => a.bindings.length > 0).length

  if (window.gtag) {
    window.gtag('event', 'download_config', {
      joystick_count: joysticks.length,
      joystick_types: joystickTypes,
      configured_actions: configuredActionsCount,
      total_actions: state.actions.length,
      completion_percentage: Math.round((configuredActionsCount / state.actions.length) * 100),
      event_category: 'conversion'
    })
  }
}

function generateConfig(): string {
  let config = 'ActionManager {\n Actions {\n'

  state.actions.forEach(action => {
    if (action.bindings.length > 0) {
      const inputSourceGUID = generateGUID()

      config += `  Action ${action.name} {\n`
      config += `   InputSource InputSourceSum "${inputSourceGUID}" {\n`
      config += `    Sources {\n`

      // Generate an InputSourceValue for each binding
      action.bindings.forEach(binding => {
        const inputValueGUID = generateGUID()
        config += `     InputSourceValue "${inputValueGUID}" {\n`
        config += `      FilterPreset "${action.filterPreset}"\n`
        config += `      Input "${binding}"\n`

        if (action.filterPreset === 'toggle') {
          const filterGUID = generateGUID()
          config += `      Filter InputFilterDown "${filterGUID}" {\n`
          config += `      }\n`
        } else if (action.filterPreset === 'hold' && (action.name.includes('Engine') || action.name.includes('ADS'))) {
          const filterGUID = generateGUID()
          config += `      Filter InputFilterHold "${filterGUID}" {\n`
          if (action.name.includes('ADSHold')) {
            config += `       HoldDuration -1\n`
          }
          config += `      }\n`
        } else if (action.name.includes('Reset')) {
          const filterGUID = generateGUID()
          config += `      Filter InputFilterSingleClick "${filterGUID}" {\n`
          config += `      }\n`
        } else if (action.name.includes('EngineStop')) {
          const filterGUID = generateGUID()
          config += `      Filter InputFilterHoldOnce "${filterGUID}" {\n`
          config += `      }\n`
        }

        config += `     }\n`
      })

      config += `    }\n`
      config += `   }\n`
      config += `  }\n`
    }
  })

  config += ' }\n}\n'
  return config
}

async function downloadConfig() {
  let defaultName = 'customInputConfig'
  const joysticks = Object.values(state.connectedGamepads)
  if (joysticks.length > 0) {
    const joystickName = joysticks[0].id
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .substring(0, 50)
    if (joystickName) {
      defaultName = joystickName
    }
  }

  let filename = prompt('Enter a name for your config file:', defaultName)
  if (filename === null) return

  filename = filename.trim()
  if (filename === '') {
    filename = defaultName
  }

  if (!filename.endsWith('.conf')) {
    filename += '.conf'
  }

  const config = generateConfig()

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Arma Reforger Config',
          accept: { 'text/plain': ['.conf'] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(config)
      await writable.close()
      trackConfigDownload()
      return
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error using File System Access API:', err)
      }
    }
  }

  const blob = new Blob([config], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  trackConfigDownload()
}

function handleLoadConfig(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      const configText = e.target?.result as string
      parseConfig(configText)
      alert('Config loaded successfully!')
    } catch (error: any) {
      alert('Error loading config: ' + error.message)
      console.error('Config parse error:', error)
    }
  }
  reader.readAsText(file)
}

function parseConfig(configText: string) {
  // Clear all existing bindings
  state.actions.forEach(action => action.bindings = [])

  // Match each Action block
  const actionBlockRegex = /Action\s+(\w+)\s*\{([\s\S]*?)\n  \}/g
  let actionMatch

  while ((actionMatch = actionBlockRegex.exec(configText)) !== null) {
    const actionName = actionMatch[1]
    const actionContent = actionMatch[2]

    const action = state.actions.find(a => a.name === actionName)
    if (action) {
      // Find all Input entries within this action
      const inputRegex = /Input\s+"([^"]+)"/g
      let inputMatch

      while ((inputMatch = inputRegex.exec(actionContent)) !== null) {
        const input = inputMatch[1]
        if (!action.bindings.includes(input)) {
          action.bindings.push(input)
        }
      }
    }
  }
}

function triggerFileInput() {
  const input = document.getElementById('config-file-input') as HTMLInputElement
  input?.click()
}

async function loadVanillaConfig(filename: string) {
  try {
    const response = await fetch(`/vanilla_configs/${filename}`)
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.statusText}`)
    }
    const configText = await response.text()
    parseConfig(configText)
    alert(`Vanilla config "${filename}" loaded successfully! You can now modify the bindings or download as-is.`)

    // Track vanilla config load
    if (window.gtag) {
      window.gtag('event', 'load_vanilla_config', {
        config_filename: filename,
        event_category: 'engagement'
      })
    }
  } catch (error: any) {
    alert('Error loading vanilla config: ' + error.message)
    console.error('Vanilla config load error:', error)
  }
}

// Cookie consent functions
function checkCookieConsent() {
  const consent = localStorage.getItem('cookieConsent')
  if (!consent) {
    showCookieConsent.value = true
  }
}

function acceptCookies() {
  localStorage.setItem('cookieConsent', 'accepted')
  showCookieConsent.value = false
}

function declineCookies() {
  localStorage.setItem('cookieConsent', 'declined')
  showCookieConsent.value = false
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  pollGamepads()
  checkCookieConsent()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <!-- Cookie Consent Banner (Non-blocking) -->
  <div v-if="showCookieConsent" class="cookie-consent-banner">
    <div class="cookie-consent-content">
      <span class="cookie-icon">🍪</span>
      <div class="cookie-consent-text">
        <p><strong>Cookie Notice:</strong> This website uses cookies to enhance your browsing experience and analyze site traffic. By using this site, you consent to our use of cookies.</p>
      </div>
      <div class="cookie-consent-actions">
        <button @click="acceptCookies" class="btn-banner btn-accept">Accept</button>
        <button @click="declineCookies" class="btn-banner btn-decline">Decline</button>
      </div>
    </div>
  </div>

  <div class="container">
    <header>
      <img src="/delta-farce-badge.png" alt="Delta Farce" class="header-badge" />
      <h1>Delta Farce - Arma Reforger HOTAS Configurator</h1>
      <p class="subtitle">Configure your joystick inputs for Arma Reforger</p>
      <div class="header-cta">
        <a href="#configurator" class="btn-cta">Start Configuring Now →</a>
        <p class="cta-subtext">Works with any joystick • No installation required</p>
      </div>
    </header>

    <!-- Community Section -->
    <div class="community-section">
      <div class="community-box">
        <h3>Join Our Community</h3>
        <div class="community-links">
          <a href="https://discord.deltafarce.win" target="_blank" rel="noopener noreferrer" class="community-link discord-link">
            <span class="icon">💬</span>
            <span>Join our Discord</span>
          </a>
          <a href="https://github.com/jscrobinson/reforger_hotas_config" target="_blank" rel="noopener noreferrer" class="community-link github-link">
            <span class="icon">⚙️</span>
            <span>Contribute on GitHub</span>
          </a>
          <a href="https://www.paypal.com/donate/?hosted_button_id=Z37V73UUKF3LY" target="_blank" rel="noopener noreferrer" class="community-link donate-link">
            <span class="icon">☕</span>
            <span>If you found this tool useful and would like to support my work, a coffee would be greatly appreciated.</span>
          </a>
          <div class="server-info">
            <span class="icon">🎮</span>
            <span>Find our servers: Search <strong>Delta Farce</strong> in the Reforger server browser</span>
          </div>
        </div>
      </div>
    </div>

    <!-- About Section -->
    <div class="about-section">
      <h2>Why Use This Tool?</h2>
      <div class="about-content">
        <p>Arma Reforger only has built-in support for two specific joystick models. For all other HOTAS (Hands On Throttle And Stick) setups and joysticks, you need to manually create and edit configuration files - a tedious and error-prone process.</p>
        <p><strong>This tool simplifies everything:</strong> It detects your connected joysticks, walks you through binding each flight control action, and generates a ready-to-use configuration file that you can drop directly into your game folder.</p>
      </div>

      <h3>How to Use</h3>
      <div class="instructions">
        <ol class="instruction-list">
          <li>
            <strong>Connect Your Joystick/HOTAS</strong>
            <p>Plug in your controller and press any button. It should appear in the "Connected Joysticks" section above.</p>
          </li>
          <li>
            <strong>Choose Your Starting Point</strong>
            <p>You have three options:</p>
            <ul>
              <li><strong>Load a Vanilla Config Template:</strong> Start with an official Arma Reforger config for Logitech Extreme 3D Pro or Saitek X56 HOTAS and customize it</li>
              <li><strong>Load Your Own Config:</strong> Upload an existing config file you've created or downloaded</li>
              <li><strong>Start From Scratch:</strong> Create a completely new configuration by binding each action yourself</li>
            </ul>
          </li>
          <li>
            <strong>Configure Actions</strong>
            <p>If starting from scratch or modifying bindings, click "Start Configuring" and follow the prompts. For each action, press the button or move the axis you want to assign, then press SPACE to confirm.</p>
          </li>
          <li>
            <strong>Use HAT Mode for Tricky Controls</strong>
            <p>If HAT switches or certain axes aren't detecting properly, enable "HAT Mode" for simplified detection.</p>
          </li>
          <li>
            <strong>Download Your Config</strong>
            <p>When finished, click "Download Config" to save your configuration file.</p>
          </li>
          <li>
            <strong>Install the Config</strong>
            <p>Copy the downloaded .conf file to your game's customInputConfigs folder:</p>
            <code>%USERPROFILE%\Documents\My Games\ArmaReforger\profile\.save\settings\customInputConfigs</code>
            <p>If the folder doesn't exist, create it. The file needs to be in the .save directory for Reforger to detect it.</p>
          </li>
          <li>
            <strong>Activate in Reforger</strong>
            <p>Launch Reforger and go to <strong>Options → Controls</strong>. At the top of the controls menu, you'll see a dropdown to select your custom input config. Choose your newly created config file.</p>
            <p><strong>Pro tip:</strong> You can keep Reforger running while you update your config file! Just modify and save the file, then reselect it from the dropdown in the Controls menu to reload your changes. This makes it easy to tweak bindings without restarting the game.</p>
          </li>
        </ol>
      </div>

      <div class="tips-box">
        <h4>💡 Pro Tips</h4>
        <ul>
          <li>Start with a vanilla config template if you have a similar joystick - it's much faster than configuring from scratch</li>
          <li>You can skip actions you don't need by clicking "Skip"</li>
          <li>Use the action list on the right to jump to specific actions</li>
          <li>Load an existing config file and modify only the bindings you want to change</li>
          <li>Test your bindings in-game and come back to adjust if needed</li>
        </ul>
      </div>

      <h3>Supported HOTAS & Flight Stick Hardware</h3>
      <div class="about-content">
        <p>This configurator works with virtually any joystick, throttle, or HOTAS system that connects via USB, including:</p>
        <ul>
          <li><strong>Thrustmaster:</strong> T.16000M, HOTAS Warthog, T.Flight HOTAS X, T.Flight HOTAS One, HOTAS Cougar</li>
          <li><strong>Logitech:</strong> Extreme 3D Pro, G X56 HOTAS, G Saitek X52, X52 Pro, G Saitek X55</li>
          <li><strong>VKB:</strong> Gladiator NXT, Gunfighter series, T-Rudders pedals</li>
          <li><strong>Virpil:</strong> VPC Constellation ALPHA, WarBRD, MongoosT-50, VPC Throttle</li>
          <li><strong>CH Products:</strong> Fighterstick, Pro Throttle, Pro Pedals</li>
          <li><strong>Microsoft:</strong> Sidewinder series</li>
          <li><strong>Generic USB joysticks and game controllers</strong> with analog axes and buttons</li>
        </ul>
        <p>If your controller shows up in Windows Game Controllers and has programmable buttons or axes, it will work with this tool. The configurator uses the browser's Gamepad API to detect inputs, so no drivers or additional software are required.</p>
      </div>

      <h3>Understanding Arma Reforger Flight Controls</h3>
      <div class="about-content">
        <p>Arma Reforger's helicopter flight model requires precise control over multiple axes simultaneously. Here's what each control system does:</p>
        <p><strong>Cyclic (Roll & Pitch):</strong> Your main flight stick controls the helicopter's cyclic. Moving the stick forward/back pitches the nose down/up, while left/right movement rolls the aircraft. This is typically your primary joystick.</p>
        <p><strong>Collective (Altitude):</strong> Usually bound to a throttle or slider, the collective controls your vertical lift. Increasing collective adds power to the rotors and makes you climb; decreasing it causes descent. Smooth collective control is essential for hovering.</p>
        <p><strong>Anti-Torque Pedals (Yaw):</strong> These counter the torque from the main rotor and control your heading. Most pilots use rudder pedals, but you can also bind yaw to a twist axis on your stick or to buttons for digital input.</p>
        <p><strong>Weapon Systems:</strong> If you're flying armed helicopters, you'll want dedicated buttons for weapons control, target cycling, and firing. Co-pilot/gunner positions have additional turret controls.</p>
        <p>The key to successful HOTAS setup in Reforger is ensuring smooth analog input for your primary flight controls (cyclic and collective) while having easily accessible buttons for secondary functions like landing gear, lights, and weapons.</p>
      </div>

      <h3>Troubleshooting Common Issues</h3>
      <div class="about-content">
        <p><strong>Controller not detected:</strong> If your joystick isn't appearing, make sure it's properly connected and recognized by Windows. Open "Set up USB game controllers" in Windows settings to verify. Try unplugging and reconnecting the device, then refresh this page.</p>
        <p><strong>Axes only registering positive values (Sidewinder X2, rudder issues):</strong> Some joysticks have axes that don't properly center at zero - for example, the Microsoft Sidewinder X2's rudder axis ranges from 0 to +11 instead of -5 to +5. If you're experiencing this issue, enable "Axis Calibration" mode during configuration. Move all your axes through their full range of motion, and the tool will automatically learn and adjust for offset center points. This is only needed for problematic joysticks - most modern controllers work fine without calibration.</p>
        <p><strong>HAT switch not working:</strong> Some HAT switches are detected as axes rather than buttons. Enable "HAT Mode" in the configurator for better detection. HAT switches typically output discrete values (often -1, 0, or +1) rather than smooth analog ranges.</p>
        <p><strong>Axis inverted or wrong direction:</strong> Reforger allows you to invert axes in-game. If your control feels backward after configuration, check the game's control settings for invert options rather than reconfiguring here.</p>
        <p><strong>Too sensitive or not sensitive enough:</strong> Axis sensitivity and dead zones can be adjusted within Arma Reforger's control settings. Start with your hardware configured here, then fine-tune sensitivity curves in-game for optimal feel.</p>
        <p><strong>Multiple controllers interfering:</strong> If you have multiple game controllers connected (like an Xbox controller for ground combat and a HOTAS for flying), make sure you're binding the correct device. The joystick index number shown in the configurator helps identify which physical device is being configured.</p>
      </div>

      <h3>WCS Mod Support (Experimental)</h3>
      <div class="about-content">
        <p>This tool includes optional support for the <strong>WCS Armament mod</strong> which adds advanced weapon systems to helicopters and vehicles. Enable "Include WCS Armament actions" in the action list to configure these bindings.</p>
        <p><strong>Note:</strong> Some WCS action names (like <em>WCS_Armament_CycleWeapon</em> for pilot weapon switching) are speculative and may not match the actual mod implementation. If you find that certain WCS bindings don't work, or if you know the correct action names, please let us know on our <a href="https://discord.deltafarce.win" target="_blank" rel="noopener noreferrer">Discord</a> or <a href="https://github.com/jscrobinson/reforger_hotas_config/issues" target="_blank" rel="noopener noreferrer">GitHub</a> so we can update the tool.</p>
      </div>
    </div>

    <!-- Configurator Tool Section -->
    <div id="configurator"></div>

    <div class="status-section">
      <div class="joystick-status">
        <h2>Connected Joysticks</h2>
        <div id="joystick-list">
          <p v-if="Object.keys(state.connectedGamepads).length === 0" class="no-joysticks">
            No joysticks detected. Connect a joystick and press any button.
          </p>
          <div v-for="gp in Object.values(state.connectedGamepads)" :key="gp.index" class="joystick-item">
            <div class="joystick-name">{{ gp.id }}</div>
            <div class="joystick-id">Joystick {{ gp.index }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="config-section">
      <div class="vanilla-configs-section">
        <h3>Load Vanilla Config Templates</h3>
        <p class="vanilla-hint">Start with an official Arma Reforger config and customize it to your needs</p>
        <div class="vanilla-configs-buttons">
          <button @click="loadVanillaConfig('Joystick_LogitechExtreme3DPro_0.conf')" class="btn btn-vanilla">
            Logitech Extreme 3D Pro
          </button>
          <button @click="loadVanillaConfig('Joystick_SaitekProFlightX56Rhino_0_Stick_1_Throttle.conf')" class="btn btn-vanilla">
            Saitek X56 HOTAS
          </button>
        </div>
      </div>

      <div class="config-controls">
        <button @click="triggerFileInput" class="btn btn-secondary">Load Your Own Config</button>
        <input type="file" id="config-file-input" accept=".conf" style="display: none;" @change="handleLoadConfig">
        <button @click="startConfiguration" :disabled="state.configuring" class="btn btn-primary">Start Configuring</button>
        <button @click="downloadConfig" :disabled="configuredCount === 0" class="btn btn-success" :class="{ 'btn-pulse': isConfigurationComplete }">
          {{ isConfigurationComplete ? '✓ Download Your Config File' : 'Download Config' }}
        </button>
        <button @click="startTestMode" :disabled="configuredCount === 0" class="btn btn-test">
          Test Bindings
        </button>
      </div>
      <div class="donate-hint">
        <a href="https://www.paypal.com/donate/?hosted_button_id=Z37V73UUKF3LY" target="_blank" rel="noopener noreferrer">
          ☕ If you found this tool useful and would like to support my work, a coffee would be greatly appreciated.
        </a>
      </div>
      <div class="save-location-hint">
        <p><strong>Save Location:</strong> %USERPROFILE%\Documents\My Games\ArmaReforger\profile\.save\settings\customInputConfigs</p>
      </div>
    </div>

    <!-- Configuration Complete Banner -->
    <div v-if="isConfigurationComplete && !testModeEnabled" class="completion-banner">
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <div class="completion-message">
          <h3>Configuration Complete!</h3>
          <p>All {{ state.actions.length }} actions have been configured. Click "Download Your Config File" above to save your configuration.</p>
        </div>
      </div>
    </div>

    <!-- Test Mode Section -->
    <div v-if="testModeEnabled" class="test-mode-section">
      <div class="test-mode-header">
        <div class="test-mode-icon">🎮</div>
        <div class="test-mode-title">
          <h2>Test Your Bindings</h2>
          <p>Press any button or move any axis on your joystick to see which actions are bound to it.</p>
        </div>
        <button @click="exitTestMode" class="btn btn-secondary">Exit Test Mode</button>
      </div>

      <div class="test-mode-content">
        <div class="test-mode-input-display">
          <div class="test-input-label">Detected Input:</div>
          <div class="test-input-value" :class="{ 'has-input': testModeInput }">
            {{ testModeInput || 'Waiting for input...' }}
          </div>
        </div>

        <div class="test-mode-results">
          <div class="test-results-label">Bound Actions:</div>
          <div v-if="!testModeInput" class="test-results-placeholder">
            Press a button or move an axis to see bound actions
          </div>
          <div v-else-if="testModeMatchingActions.length === 0" class="test-results-empty">
            No actions are bound to this input
          </div>
          <div v-else class="test-results-list">
            <div v-for="action in testModeMatchingActions" :key="action.name" class="test-result-item">
              <span class="test-result-name">{{ formatActionName(action.name) }}</span>
              <span class="test-result-hint">{{ action.hint }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="test-mode-options">
        <label class="hat-mode-label">
          <input type="checkbox" v-model="hatModeEnabled">
          <span>HAT Mode (simplified axis detection)</span>
        </label>
      </div>

      <!-- Live Input Visualization -->
      <div class="test-mode-visualization">
        <div class="test-viz-header">
          <h3>Live Input Monitor</h3>
        </div>
        <div v-if="gamepadVisualizations.length === 0" class="test-viz-no-devices">
          <p>No joysticks detected. Connect a joystick and press any button.</p>
        </div>
        <div v-for="gamepadViz in gamepadVisualizations" :key="gamepadViz.index" class="test-viz-gamepad">
          <div class="test-viz-gamepad-header">
            <span class="test-viz-device-number">Device {{ gamepadViz.index }}</span>
            <span class="test-viz-device-name">{{ gamepadViz.name }}</span>
          </div>
          <div class="test-viz-content">
            <div class="test-viz-axes">
              <div v-for="(value, axisIndex) in gamepadViz.axes" :key="`test-device-${gamepadViz.index}-axis-${axisIndex}`" class="test-viz-axis">
                <span class="test-viz-axis-label">Axis {{ axisIndex }}</span>
                <div class="test-viz-axis-bar-container">
                  <div class="test-viz-axis-center-line"></div>
                  <div class="test-viz-axis-bar" :class="{ active: Math.abs(value) > 0.1 }" :style="{
                    left: value < 0 ? `${((value + 1) / 2) * 100}%` : '50%',
                    width: value < 0 ? `${(50 - ((value + 1) / 2) * 100)}%` : `${(((value + 1) / 2) - 0.5) * 100}%`
                  }"></div>
                </div>
                <span class="test-viz-axis-value">{{ value.toFixed(2) }}</span>
              </div>
            </div>
            <div class="test-viz-buttons">
              <div v-for="(pressed, btnIndex) in gamepadViz.buttons" :key="`test-device-${gamepadViz.index}-button-${btnIndex}`"
                   class="test-viz-button" :class="{ active: pressed }">
                <span class="test-viz-button-number">{{ btnIndex }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="state.configuring" class="current-action-section">
        <h2>Current Action</h2>
        <div class="action-display">
          <div class="action-name">{{ currentAction ? formatActionName(currentAction.name) : '-' }}</div>
          <div v-if="currentAction" class="action-info">
            <span class="importance-indicator" :class="currentAction.importance"></span>
            <span class="action-description">{{ currentAction.hint }}</span>
            <span class="hardware-hint" :class="currentAction.hardware">{{ currentAction.hardware }}</span>
          </div>
          <div class="action-prompt">Press any button or move any axis</div>
          <div class="action-hint">Use ↑↓ arrows or click to navigate actions • Enable HAT Mode for difficult HAT switches</div>

          <!-- Fire Action Notice -->
          <div v-if="isCurrentActionFireAction" class="fire-action-notice">
            <div class="fire-action-icon">🎯</div>
            <div class="fire-action-content">
              <strong>Important: Fire Button Binding</strong>
              <p>All fire actions (CharacterFire, TurretFire, HelicopterFire, VehicleFire) should be bound to the SAME trigger button. This ensures consistent firing across all vehicle types and on-foot combat.</p>
              <div v-if="firstConfiguredFireAction && firstConfiguredFireAction.name !== currentAction?.name" class="fire-action-suggestion">
                <p>✓ You already configured <strong>{{ formatActionName(firstConfiguredFireAction.name) }}</strong> to <strong>{{ firstConfiguredFireAction.bindings.join(', ') }}</strong></p>
                <button @click="copyFireActionBinding" class="btn btn-primary btn-small">
                  Use Same Bindings ({{ firstConfiguredFireAction.bindings.join(', ') }})
                </button>
              </div>
            </div>
          </div>

          <!-- Weapon Switch Action Notice -->
          <div v-if="isCurrentActionWeaponSwitch" class="fire-action-notice">
            <div class="fire-action-icon">🔄</div>
            <div class="fire-action-content">
              <strong>Important: Weapon Switch Binding</strong>
              <p>All weapon switch actions (CharacterNextWeapon, TurretNextWeapon) should be bound to the SAME button. This ensures consistent weapon cycling across all contexts.</p>
              <div v-if="firstConfiguredWeaponSwitchAction && firstConfiguredWeaponSwitchAction.name !== currentAction?.name" class="fire-action-suggestion">
                <p>✓ You already configured <strong>{{ formatActionName(firstConfiguredWeaponSwitchAction.name) }}</strong> to <strong>{{ firstConfiguredWeaponSwitchAction.bindings.join(', ') }}</strong></p>
                <button @click="copyWeaponSwitchBinding" class="btn btn-primary btn-small">
                  Use Same Bindings ({{ firstConfiguredWeaponSwitchAction.bindings.join(', ') }})
                </button>
              </div>
            </div>
          </div>

          <div class="input-detection-container">
            <div class="input-detected" :class="{ 'has-input': state.pendingInput || (currentAction?.bindings && currentAction.bindings.length > 0) }">
              <div v-if="!state.pendingInput && (!currentAction?.bindings || currentAction.bindings.length === 0)" class="waiting-message">Waiting for input...</div>
              <div v-else-if="state.pendingInput">
                <strong>{{ state.pendingInput }}</strong>
              </div>
              <div v-else-if="currentAction?.bindings && currentAction.bindings.length > 0">
                <div v-for="(binding, index) in currentAction.bindings" :key="index" class="binding-item">
                  <strong>{{ binding }}</strong>
                  <button @click="removeBinding(index)" class="btn-remove-binding" title="Remove this binding">×</button>
                </div>
              </div>
            </div>
            <div v-if="state.pendingInput" class="confirmation-prompt">
              <div class="confirm-icon">✓</div>
              <div class="confirm-text">Press <kbd>SPACE</kbd> to confirm and add binding</div>
            </div>
            <div v-else-if="currentAction?.bindings && currentAction.bindings.length > 0" class="add-more-prompt">
              <div class="add-more-text" v-if="autoProgressEnabled">Action configured! Disable auto-progress below to add multiple bindings, or press <kbd>↓</kbd> to continue</div>
              <div class="add-more-text" v-else>Press any button or move any axis to add another binding, or press <kbd>↓</kbd> to continue</div>
            </div>
          </div>
          <div class="hat-mode-control">
            <label class="hat-mode-label">
              <input type="checkbox" v-model="autoProgressEnabled">
              <span>Auto-progress to next action (simpler workflow for single bindings)</span>
            </label>
            <label class="hat-mode-label">
              <input type="checkbox" v-model="hatModeEnabled">
              <span>HAT Mode (simplified axis detection)</span>
            </label>
            <label class="hat-mode-label">
              <input type="checkbox" v-model="calibrationModeEnabled">
              <span>Axis Calibration (for offset axes like Sidewinder X2 rudder)</span>
            </label>
          </div>

          <div v-if="calibrationModeEnabled" class="calibration-instructions">
            <p><strong>📍 Calibration Mode Active:</strong> Move all your axes through their full range of motion (throttles min to max, rudder full left to right, stick all directions) before configuring actions. This helps the tool learn your joystick's natural center points.</p>
          </div>

          <div class="action-controls">
            <button @click="skipCurrentAction" class="btn btn-secondary">Skip</button>
            <button @click="clearCurrentActionBinding" class="btn btn-warning">Clear Binding</button>
            <button v-if="showResumeButton" @click="resumeConfiguration" class="btn btn-primary">
              Resume from Action {{ resumeActionNumber }}
            </button>
          </div>

          <!-- Joystick Visualization -->
          <div class="joystick-visualization">
            <div class="viz-header">
              <h3>Live Input Monitor</h3>
            </div>
            <div v-if="gamepadVisualizations.length === 0" class="viz-no-devices">
              <p>No joysticks detected. Connect a joystick and press any button.</p>
            </div>
            <div v-for="gamepadViz in gamepadVisualizations" :key="gamepadViz.index" class="viz-gamepad">
              <div class="viz-gamepad-header">
                <span class="viz-device-number">Device {{ gamepadViz.index }}</span>
                <span class="viz-device-name">{{ gamepadViz.name }}</span>
              </div>
              <div class="viz-content">
                <div class="viz-axes">
                  <div v-for="(value, axisIndex) in gamepadViz.axes" :key="`device-${gamepadViz.index}-axis-${axisIndex}`" class="viz-axis">
                    <span class="viz-axis-label">
                      <span class="viz-device-badge">{{ gamepadViz.index }}</span>
                      Axis {{ axisIndex }}
                    </span>
                    <div class="viz-axis-bar-container">
                      <div class="viz-axis-center-line"></div>
                      <div class="viz-axis-bar" :class="{ active: Math.abs(value) > 0.1 }" :style="{
                        left: value < 0 ? `${((value + 1) / 2) * 100}%` : '50%',
                        width: value < 0 ? `${(50 - ((value + 1) / 2) * 100)}%` : `${(((value + 1) / 2) - 0.5) * 100}%`
                      }"></div>
                    </div>
                    <span class="viz-axis-value">{{ value.toFixed(2) }}</span>
                  </div>
                </div>
                <div class="viz-buttons">
                  <div v-for="(pressed, btnIndex) in gamepadViz.buttons" :key="`device-${gamepadViz.index}-button-${btnIndex}`"
                       class="viz-button" :class="{ active: pressed }">
                    <span class="viz-button-device">{{ gamepadViz.index }}</span>
                    <span class="viz-button-number">{{ btnIndex }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="progress">
          <div class="progress-text">{{ configuredCount }} / {{ state.actions.length }}</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
        </div>
      </div>

      <div class="actions-list-section">
        <h2>Actions</h2>
        <div class="filter-controls">
          <button class="filter-btn" :class="{ active: state.filter === 'all' }" @click="state.filter = 'all'">
            All (<span>{{ state.actions.length }}</span>)
          </button>
          <button class="filter-btn" :class="{ active: state.filter === 'configured' }" @click="state.filter = 'configured'">
            Configured (<span>{{ configuredCount }}</span>)
          </button>
          <button class="filter-btn" :class="{ active: state.filter === 'unconfigured' }" @click="state.filter = 'unconfigured'">
            Unconfigured (<span>{{ unconfiguredCount }}</span>)
          </button>
        </div>
        <div class="wcs-toggle">
          <label class="wcs-toggle-label">
            <input type="checkbox" v-model="wcsActionsEnabled">
            <span>Include WCS Armament actions (mod)</span>
          </label>
        </div>
        <div class="actions-list">
          <div v-for="action in filteredActions" :key="action.name"
               class="action-item"
               :class="{
                 current: state.actions.indexOf(action) === state.currentActionIndex,
                 configured: action.bindings.length > 0,
                 clickable: state.configuring
               }"
               @click="state.configuring && jumpToAction(state.actions.indexOf(action))">
            <span class="action-item-name">{{ formatActionName(action.name) }}</span>
            <span class="action-item-binding">{{ action.bindings.length > 0 ? action.bindings.join(', ') : '-' }}</span>
            <span class="action-item-status"></span>
          </div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <p>
        <a href="https://github.com/jscrobinson/reforger_hotas_config" target="_blank" rel="noopener noreferrer">
          Arma Reforger HOTAS Configurator
        </a>
        <span class="version-separator">•</span>
        <span class="version-info">Version: <code>{{ gitHash }}</code></span>
      </p>
      <p class="credits">Designed by StormPale</p>
    </footer>
  </div>
</template>
