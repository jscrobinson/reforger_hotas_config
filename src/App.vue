<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import type { Action, AppState, GamepadState } from './types'

// Action definitions with sensible FilterPreset defaults and hints
const ACTIONS: Omit<Action, 'binding'>[] = [
  { name: 'PerformAction', filterPreset: 'pressed', hint: 'Interact with objects/doors', hardware: 'button', importance: 'important' },
  { name: 'SelectAction', filterPreset: 'next', hint: 'Open action menu', hardware: 'button', importance: 'important' },
  { name: 'CharacterNextWeapon', filterPreset: 'click', hint: 'Switch to next weapon', hardware: 'hat', importance: 'important' },
  { name: 'CharacterFire', filterPreset: 'hold', hint: 'Fire primary weapon', hardware: 'trigger', importance: 'critical' },
  { name: 'CharacterNextFireMode', filterPreset: 'click', hint: 'Change fire mode (single/burst/auto)', hardware: 'button', importance: 'important' },
  { name: 'CharacterNextMuzzle', filterPreset: 'click', hint: 'Select next muzzle/barrel', hardware: 'button', importance: 'optional' },
  { name: 'GadgetMap', filterPreset: 'select', hint: 'Open tactical map', hardware: 'button', importance: 'important' },
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
  { name: 'WeaponToggleSightsIllumination', filterPreset: 'click', hint: 'Toggle reticle illumination', hardware: 'button', importance: 'optional' },
  { name: 'WeaponSwitchOptics', filterPreset: 'click', hint: 'Change zoom/magnification', hardware: 'button', importance: 'important' },
  { name: 'TurretFire', filterPreset: 'hold', hint: 'Fire turret weapon', hardware: 'trigger', importance: 'important' },
  { name: 'TurretReload', filterPreset: 'click', hint: 'Reload turret weapon', hardware: 'button', importance: 'important' },
  { name: 'TurretNextWeapon', filterPreset: 'click', hint: 'Cycle turret weapons', hardware: 'hat', importance: 'important' },
  { name: 'TurretNextFireMode', filterPreset: 'click', hint: 'Change turret fire mode', hardware: 'button', importance: 'optional' },
  { name: 'TurretADS', filterPreset: 'click', hint: 'Aim down sights (toggle)', hardware: 'button', importance: 'optional' },
  { name: 'TurretADSHold', filterPreset: 'hold', hint: 'Aim down sights (hold)', hardware: 'button', importance: 'optional' },
  { name: 'TurretRotateLeft', filterPreset: 'left', hint: 'Rotate turret left', hardware: 'stick', importance: 'important' },
  { name: 'TurretRotateRight', filterPreset: 'right', hint: 'Rotate turret right', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimUp', filterPreset: 'up', hint: 'Elevate turret up', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimDown', filterPreset: 'down', hint: 'Depress turret down', hardware: 'stick', importance: 'important' },
  { name: 'TurretAimLeft', filterPreset: 'left', hint: 'Fine aim left', hardware: 'stick', importance: 'optional' },
  { name: 'TurretAimRight', filterPreset: 'right', hint: 'Fine aim right', hardware: 'stick', importance: 'optional' },
  { name: 'VONDirectToggle', filterPreset: 'click', hint: 'Toggle proximity voice chat', hardware: 'button', importance: 'important' },
  { name: 'VONChannel', filterPreset: 'hold', hint: 'Push-to-talk radio', hardware: 'button', importance: 'important' },
  { name: 'GetOut', filterPreset: 'click', hint: 'Exit vehicle safely', hardware: 'button', importance: 'important' },
  { name: 'JumpOut', filterPreset: 'click', hint: 'Emergency eject (dangerous!)', hardware: 'button', importance: 'optional' },
  { name: 'HelicopterEngineStart', filterPreset: 'hold', hint: 'Start engine and rotors', hardware: 'button', importance: 'critical' },
  { name: 'HelicopterEngineStop', filterPreset: 'click', hint: 'Stop engine and rotors', hardware: 'button', importance: 'critical' }
]

// State
const state = reactive<AppState>({
  actions: ACTIONS.map(action => ({ ...action, binding: null })),
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

const hatModeEnabled = ref(false)
const vizAxesCount = ref(0)
const vizButtonsCount = ref(0)
const vizDeviceName = ref('No device detected')
const vizAxesValues = ref<number[]>([])
const vizButtonsPressed = ref<boolean[]>([])

// Git commit hash injected at build time
const gitHash = __GIT_HASH__

// Computed
const filteredActions = computed(() => {
  return state.actions.filter(action => {
    if (state.filter === 'configured') return action.binding
    if (state.filter === 'unconfigured') return !action.binding
    return true
  })
})

const configuredCount = computed(() => state.actions.filter(a => a.binding).length)
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
    while (resumeIndex < state.actions.length && state.actions[resumeIndex].binding) {
      resumeIndex++
    }
    return resumeIndex < state.actions.length
  }
  return false
})

const resumeActionNumber = computed(() => {
  let resumeIndex = state.furthestActionIndex
  while (resumeIndex < state.actions.length && state.actions[resumeIndex].binding) {
    resumeIndex++
  }
  return resumeIndex + 1
})

const isConfigurationComplete = computed(() => {
  return configuredCount.value === state.actions.length && configuredCount.value > 0
})

// Methods
function formatActionName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim()
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

function startConfiguration() {
  state.configuring = true
  state.currentActionIndex = 0
  state.furthestActionIndex = 0
  state.inputCooldown = false
  resetGamepadBaseline()
}

function skipCurrentAction() {
  state.inputCooldown = false
  state.pendingInput = null
  resetGamepadBaseline()
  nextAction()
}

function clearCurrentActionBinding() {
  if (currentAction.value) {
    currentAction.value.binding = null
    state.pendingInput = null
    state.inputCooldown = false
    resetGamepadBaseline()
  }
}

function nextAction() {
  state.pendingInput = null

  let nextIndex = state.currentActionIndex + 1
  while (nextIndex < state.actions.length && state.actions[nextIndex].binding) {
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
  while (nextIndex < state.actions.length && state.actions[nextIndex].binding) {
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

function confirmInput() {
  if (state.pendingInput && currentAction.value) {
    currentAction.value.binding = state.pendingInput
    state.pendingInput = null
    state.inputCooldown = true
    setTimeout(() => {
      state.inputCooldown = false
      resetGamepadBaseline()
      nextAction()
    }, 300)
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
    const axisValue = gamepad.axes[i]
    const prevAxisValue = prevState.axes[i] !== undefined ? prevState.axes[i] : axisValue
    const baselineAxisValue = baselineState?.axes[i] !== undefined ? baselineState.axes[i] : axisValue

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

function updateVisualization(gamepad: Gamepad | null) {
  if (!gamepad) return

  vizDeviceName.value = gamepad.id
  vizAxesValues.value = [...gamepad.axes]
  vizButtonsPressed.value = gamepad.buttons.map(b => b.pressed)
}

let animationFrameId: number | null = null

function pollGamepads() {
  const gamepads = navigator.getGamepads()
  let hasGamepads = false
  let firstGamepad: Gamepad | null = null

  for (let i = 0; i < gamepads.length; i++) {
    const gamepad = gamepads[i]
    if (gamepad) {
      hasGamepads = true
      if (!firstGamepad) firstGamepad = gamepad

      if (!state.connectedGamepads[i]) {
        state.connectedGamepads[i] = {
          id: gamepad.id,
          index: i
        }
        vizAxesCount.value = gamepad.axes.length
        vizButtonsCount.value = gamepad.buttons.length
      }

      if (state.configuring && state.currentActionIndex >= 0) {
        detectInput(gamepad, i)
      }
    }
  }

  if (!hasGamepads && Object.keys(state.connectedGamepads).length > 0) {
    state.connectedGamepads = {}
  }

  if (firstGamepad) {
    updateVisualization(firstGamepad)
  }

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
  return '{' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16).toUpperCase()
  }) + '}'
}

function generateConfig(): string {
  let config = 'ActionManager {\n Actions {\n'

  state.actions.forEach(action => {
    if (action.binding) {
      const inputSourceGUID = generateGUID()
      const inputValueGUID = generateGUID()

      config += `  Action ${action.name} {\n`
      config += `   InputSource InputSourceSum "${inputSourceGUID}" {\n`
      config += `    Sources {\n`
      config += `     InputSourceValue "${inputValueGUID}" {\n`
      config += `      FilterPreset "${action.filterPreset}"\n`
      config += `      Input "${action.binding}"\n`

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
  const actionRegex = /Action\s+(\w+)\s*{[\s\S]*?Input\s+"([^"]+)"/g
  let match

  state.actions.forEach(action => action.binding = null)

  while ((match = actionRegex.exec(configText)) !== null) {
    const actionName = match[1]
    const input = match[2]

    const action = state.actions.find(a => a.name === actionName)
    if (action) {
      action.binding = input
    }
  }
}

function triggerFileInput() {
  const input = document.getElementById('config-file-input') as HTMLInputElement
  input?.click()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  pollGamepads()

  // Initialize AdSense ads after DOM is rendered and layout is calculated
  // Use setTimeout to ensure CSS has been applied and width is calculated
  setTimeout(() => {
    try {
      const adElements = document.querySelectorAll('.adsbygoogle')
      console.log('Found', adElements.length, 'ad units')

      let initializedCount = 0
      adElements.forEach((ad, index) => {
        // Check if this ad has already been initialized
        const adElement = ad as HTMLElement
        const status = adElement.getAttribute('data-adsbygoogle-status')

        if (status === 'done') {
          console.log(`Ad ${index} already initialized, skipping`)
          return
        }

        const container = ad.parentElement
        if (container) {
          const width = container.offsetWidth
          console.log(`Ad ${index} container width:`, width)
          if (width === 0) {
            console.warn(`Ad ${index} has zero width, this will cause errors`)
            return
          }
        }

        (window.adsbygoogle = window.adsbygoogle || []).push({})
        initializedCount++
      })

      console.log(`Initialized ${initializedCount} new ad units`)
    } catch (err) {
      console.error('AdSense initialization error:', err)
    }
  }, 100)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <div class="container">
    <header>
      <h1>Delta Farce - Arma Reforger HOTAS Configurator</h1>
      <p class="subtitle">Configure your joystick inputs for Arma Reforger</p>
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
            <strong>Start Configuring</strong>
            <p>Click "Start Configuring" and follow the prompts. For each action, press the button or move the axis you want to assign, then press SPACE to confirm.</p>
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
          <li>You can skip actions you don't need by clicking "Skip"</li>
          <li>Use the action list on the right to jump to specific actions</li>
          <li>You can load an existing config file and modify it instead of starting from scratch</li>
          <li>Test your bindings in-game and come back to adjust if needed</li>
        </ul>
      </div>
    </div>

    <!-- Ad: Top Banner -->
    <div class="ad-container">
      <ins class="adsbygoogle"
           style="display:block;min-width:300px;width:100%"
           data-ad-client="ca-pub-8117946503724556"
           data-ad-slot="8517600527"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>

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
      <div class="config-controls">
        <button @click="triggerFileInput" class="btn btn-secondary">Load Existing Config</button>
        <input type="file" id="config-file-input" accept=".conf" style="display: none;" @change="handleLoadConfig">
        <button @click="startConfiguration" :disabled="state.configuring" class="btn btn-primary">Start Configuring</button>
        <button @click="downloadConfig" :disabled="configuredCount === 0" class="btn btn-success" :class="{ 'btn-pulse': isConfigurationComplete }">
          {{ isConfigurationComplete ? '✓ Download Your Config File' : 'Download Config' }}
        </button>
      </div>
      <div class="save-location-hint">
        <p><strong>Save Location:</strong> %USERPROFILE%\Documents\My Games\ArmaReforger\profile\.save\settings\customInputConfigs</p>
      </div>
    </div>

    <!-- Configuration Complete Banner -->
    <div v-if="isConfigurationComplete" class="completion-banner">
      <div class="completion-content">
        <div class="completion-icon">🎉</div>
        <div class="completion-message">
          <h3>Configuration Complete!</h3>
          <p>All {{ state.actions.length }} actions have been configured. Click "Download Your Config File" above to save your configuration.</p>
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
          <div class="input-detection-container">
            <div class="input-detected" :class="{ 'has-input': state.pendingInput || currentAction?.binding }">
              <div v-if="!state.pendingInput && !currentAction?.binding" class="waiting-message">Waiting for input...</div>
              <strong v-else>{{ state.pendingInput || currentAction?.binding }}</strong>
            </div>
            <div v-if="state.pendingInput" class="confirmation-prompt">
              <div class="confirm-icon">✓</div>
              <div class="confirm-text">Press <kbd>SPACE</kbd> to confirm</div>
            </div>
          </div>
          <div class="hat-mode-control">
            <label class="hat-mode-label">
              <input type="checkbox" v-model="hatModeEnabled">
              <span>HAT Mode (simplified axis detection)</span>
            </label>
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
              <span class="viz-device-name">{{ vizDeviceName }}</span>
            </div>
            <div class="viz-content">
              <div class="viz-axes">
                <div v-for="(value, index) in vizAxesValues" :key="`axis-${index}`" class="viz-axis">
                  <span class="viz-axis-label">Axis {{ index }}</span>
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
                <div v-for="(pressed, index) in vizButtonsPressed" :key="`button-${index}`"
                     class="viz-button" :class="{ active: pressed }">
                  {{ index }}
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
        <div class="actions-list">
          <div v-for="action in filteredActions" :key="action.name"
               class="action-item"
               :class="{
                 current: state.actions.indexOf(action) === state.currentActionIndex,
                 configured: action.binding,
                 clickable: state.configuring
               }"
               @click="state.configuring && jumpToAction(state.actions.indexOf(action))">
            <span class="action-item-name">{{ formatActionName(action.name) }}</span>
            <span class="action-item-binding">{{ action.binding || '-' }}</span>
            <span class="action-item-status"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Ad: Bottom Banner -->
    <div class="ad-container ad-bottom">
      <ins class="adsbygoogle"
           style="display:block;min-width:300px;width:100%"
           data-ad-client="ca-pub-8117946503724556"
           data-ad-slot="8517600527"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
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
    </footer>
  </div>
</template>
