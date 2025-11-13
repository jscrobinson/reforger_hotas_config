// Arma Reforger HOTAS Configurator
// ====================================

// Action definitions with sensible FilterPreset defaults
const ACTIONS = [
    { name: 'PerformAction', filterPreset: 'pressed' },
    { name: 'SelectAction', filterPreset: 'next' },  // Special case - multiple inputs in original
    { name: 'CharacterNextWeapon', filterPreset: 'click' },
    { name: 'CharacterFire', filterPreset: 'hold' },
    { name: 'CharacterNextFireMode', filterPreset: 'click' },
    { name: 'CharacterNextMuzzle', filterPreset: 'click' },
    { name: 'GadgetMap', filterPreset: 'select' },
    { name: 'HelicopterCollectiveIncrease', filterPreset: 'up' },
    { name: 'HelicopterCollectiveDecrease', filterPreset: 'down' },
    { name: 'HelicopterAntiTorqueLeft', filterPreset: 'left' },
    { name: 'HelicopterAntiTorqueRight', filterPreset: 'right' },
    { name: 'HelicopterCyclicForward', filterPreset: 'forward' },
    { name: 'HelicopterCyclicBack', filterPreset: 'back' },
    { name: 'HelicopterCyclicLeft', filterPreset: 'left' },
    { name: 'HelicopterCyclicRight', filterPreset: 'right' },
    { name: 'HelicopterWheelBrake', filterPreset: 'pressed' },
    { name: 'HelicopterWheelBrakePersistent', filterPreset: 'pressed' },
    { name: 'HelicopterAutohoverToggle', filterPreset: 'click' },
    { name: 'HelicopterLightsTaxiToggle', filterPreset: 'toggle' },
    { name: 'HelicopterLightsLandingToggle', filterPreset: 'toggle' },
    { name: 'WeaponToggleSightsIllumination', filterPreset: 'click' },
    { name: 'WeaponSwitchOptics', filterPreset: 'click' },
    { name: 'TurretFire', filterPreset: 'hold' },
    { name: 'TurretReload', filterPreset: 'click' },
    { name: 'TurretNextWeapon', filterPreset: 'click' },
    { name: 'TurretNextFireMode', filterPreset: 'click' },
    { name: 'TurretADS', filterPreset: 'click' },
    { name: 'TurretADSHold', filterPreset: 'hold' },
    { name: 'TurretRotateLeft', filterPreset: 'left' },
    { name: 'TurretRotateRight', filterPreset: 'right' },
    { name: 'TurretAimUp', filterPreset: 'up' },
    { name: 'TurretAimDown', filterPreset: 'down' },
    { name: 'TurretAimLeft', filterPreset: 'left' },
    { name: 'TurretAimRight', filterPreset: 'right' },
    { name: 'VONDirectToggle', filterPreset: 'click' },
    { name: 'VONChannel', filterPreset: 'hold' },
    { name: 'GetOut', filterPreset: 'click' },
    { name: 'JumpOut', filterPreset: 'click' },
    { name: 'HelicopterEngineStart', filterPreset: 'hold' },
    { name: 'HelicopterEngineStop', filterPreset: 'click' }
];

// State management
let state = {
    actions: ACTIONS.map(action => ({ ...action, binding: null })),
    currentActionIndex: -1,
    furthestActionIndex: -1,  // Track furthest action reached
    configuring: false,
    connectedGamepads: {},
    previousGamepadState: {},  // Frame-to-frame state for detecting changes
    baselineGamepadState: {},  // Baseline when action started (for throttles)
    filter: 'all',
    inputCooldown: false,  // Prevent rapid-fire input detection
    pendingInput: null  // Input detected but waiting for confirmation
};

// DOM elements
let elements = {};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Cache DOM elements
    elements = {
        joystickList: document.getElementById('joystick-list'),
        startConfigBtn: document.getElementById('start-config-btn'),
        downloadConfigBtn: document.getElementById('download-config-btn'),
        loadConfigBtn: document.getElementById('load-config-btn'),
        configFileInput: document.getElementById('config-file-input'),
        currentActionSection: document.getElementById('current-action-section'),
        currentActionName: document.getElementById('current-action-name'),
        inputDetected: document.getElementById('input-detected'),
        hatModeCheckbox: document.getElementById('hat-mode-checkbox'),
        skipActionBtn: document.getElementById('skip-action-btn'),
        clearActionBtn: document.getElementById('clear-action-btn'),
        resumeBtn: document.getElementById('resume-btn'),
        resumeActionNumber: document.getElementById('resume-action-number'),
        progressText: document.getElementById('progress-text'),
        progressFill: document.getElementById('progress-fill'),
        actionsList: document.getElementById('actions-list'),
        countAll: document.getElementById('count-all'),
        countConfigured: document.getElementById('count-configured'),
        countUnconfigured: document.getElementById('count-unconfigured')
    };

    // Event listeners
    elements.startConfigBtn.addEventListener('click', startConfiguration);
    elements.downloadConfigBtn.addEventListener('click', downloadConfig);
    elements.loadConfigBtn.addEventListener('click', () => elements.configFileInput.click());
    elements.configFileInput.addEventListener('change', loadConfig);
    elements.skipActionBtn.addEventListener('click', skipCurrentAction);
    elements.clearActionBtn.addEventListener('click', clearCurrentActionBinding);
    elements.resumeBtn.addEventListener('click', resumeConfiguration);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderActionsList();
        });
    });

    // Keyboard listener for space bar confirmation and arrow navigation
    document.addEventListener('keydown', (event) => {
        if (!state.configuring) return;

        if (event.code === 'Space' || event.key === ' ') {
            if (state.pendingInput) {
                event.preventDefault(); // Prevent page scroll
                confirmInput();
            }
        } else if (event.code === 'ArrowUp' || event.key === 'ArrowUp') {
            event.preventDefault();
            navigateToPreviousAction();
        } else if (event.code === 'ArrowDown' || event.key === 'ArrowDown') {
            event.preventDefault();
            navigateToNextAction();
        }
    });

    // Start gamepad polling
    pollGamepads();

    // Render initial UI
    renderActionsList();
    updateCounts();
}

// Gamepad polling and detection
function pollGamepads() {
    const gamepads = navigator.getGamepads();
    let hasGamepads = false;

    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
            hasGamepads = true;
            if (!state.connectedGamepads[i]) {
                state.connectedGamepads[i] = {
                    id: gamepad.id,
                    index: i
                };
                renderJoystickList();
            }

            // Store current state for change detection
            if (state.configuring && state.currentActionIndex >= 0) {
                detectInput(gamepad, i);
            }
        }
    }

    if (!hasGamepads && Object.keys(state.connectedGamepads).length > 0) {
        state.connectedGamepads = {};
        renderJoystickList();
    }

    requestAnimationFrame(pollGamepads);
}

function detectInput(gamepad, gamepadIndex) {
    // Skip if in cooldown period
    if (state.inputCooldown) {
        return;
    }

    // Initialize previous state if not exists
    if (!state.previousGamepadState[gamepadIndex]) {
        state.previousGamepadState[gamepadIndex] = {
            buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
            axes: [...gamepad.axes]
        };
        return;
    }

    const prevState = state.previousGamepadState[gamepadIndex];

    // Check buttons first (priority over axes)
    for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        const prevButton = prevState.buttons[i] || { pressed: false };

        if (button.pressed && !prevButton.pressed) {
            assignInput(`joystick${gamepadIndex}:button${i}`);
            return;
        }
    }

    // Check axes
    const AXIS_THRESHOLD = 0.75;
    const HAT_THRESHOLD = 0.5;  // Threshold for detecting hat switch activation
    const FRAME_DELTA_THRESHOLD = 0.3;  // Frame-to-frame change for hat switches
    const TOTAL_MOVEMENT_THRESHOLD = 0.5;  // Total movement from baseline for throttles

    // Get baseline state (captured when action started)
    const baselineState = state.baselineGamepadState[gamepadIndex];

    for (let i = 0; i < gamepad.axes.length; i++) {
        const axisValue = gamepad.axes[i];
        const prevAxisValue = prevState.axes[i] !== undefined ? prevState.axes[i] : axisValue;
        const baselineAxisValue = baselineState?.axes[i] !== undefined ? baselineState.axes[i] : axisValue;

        // Calculate frame-to-frame delta and total movement from baseline
        const frameDelta = Math.abs(axisValue - prevAxisValue);
        const totalMovement = Math.abs(axisValue - baselineAxisValue);

        // HAT MODE: Simplified detection when user enables HAT mode checkbox
        if (elements.hatModeCheckbox.checked) {
            // Just detect any significant frame-to-frame change above threshold
            if (frameDelta > 0.25) {
                // Determine direction based on which side of zero we're on
                if (Math.abs(axisValue) > 0.3) {
                    const direction = axisValue > 0 ? '+' : '-';
                    assignInput(`joystick${gamepadIndex}:axis${i}${direction}`);
                    return;
                }
            }
        }

        // Detect hat switch behavior: discrete values that snap between positions
        // Hat switches typically snap between -1, 0, 1 (or similar discrete values)
        const isNearDiscrete = Math.abs(Math.abs(axisValue) - 1.0) < 0.15 || Math.abs(axisValue) < 0.15;
        const prevWasNeutral = Math.abs(prevAxisValue) < 0.3;
        const nowAtExtreme = Math.abs(axisValue) > HAT_THRESHOLD;

        // Hat switch detection: significant change to/from a discrete position
        // Simplified: just detect significant frame-to-frame changes that land on discrete values
        if (frameDelta > FRAME_DELTA_THRESHOLD && isNearDiscrete && nowAtExtreme) {
            // Determine direction based on current value
            let direction;
            if (axisValue < -HAT_THRESHOLD) {
                direction = '-';
            } else if (axisValue > HAT_THRESHOLD) {
                direction = '+';
            }

            if (direction) {
                assignInput(`joystick${gamepadIndex}:axis${i}${direction}`);
                return;
            }
        }

        // Regular analog axis detection: joysticks, throttles, sliders
        // Use total movement from baseline AND current position past threshold
        if (totalMovement > TOTAL_MOVEMENT_THRESHOLD && !isNearDiscrete) {
            // Check if we're at an extreme position
            if (axisValue > AXIS_THRESHOLD) {
                assignInput(`joystick${gamepadIndex}:axis${i}+`);
                return;
            } else if (axisValue < -AXIS_THRESHOLD) {
                assignInput(`joystick${gamepadIndex}:axis${i}-`);
                return;
            }
        }
    }

    // Update previous state every frame (needed for hat switch detection)
    state.previousGamepadState[gamepadIndex] = {
        buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
        axes: [...gamepad.axes]
    };
}

function assignInput(input) {
    if (state.currentActionIndex >= 0 && state.currentActionIndex < state.actions.length) {
        // Store as pending input, waiting for confirmation
        state.pendingInput = input;

        // Show the input with a helpful description
        const description = describeInput(input);
        elements.inputDetected.textContent = input + ' - Press SPACE to accept';
        elements.inputDetected.title = description;

        // Set cooldown to prevent multiple rapid detections
        state.inputCooldown = true;

        // Release cooldown after a short delay
        setTimeout(() => {
            state.inputCooldown = false;
        }, 300);
    }
}

function confirmInput() {
    if (state.pendingInput && state.currentActionIndex >= 0 && state.currentActionIndex < state.actions.length) {
        // Actually assign the input
        state.actions[state.currentActionIndex].binding = state.pendingInput;
        state.pendingInput = null;

        // Update UI
        renderActionsList();
        updateCounts();

        // Set cooldown and move to next action
        state.inputCooldown = true;
        setTimeout(() => {
            state.inputCooldown = false;
            resetGamepadBaseline();
            nextAction();
        }, 300);
    }
}

// Describe what the input means in human-readable form
function describeInput(input) {
    const match = input.match(/joystick(\d+):(button|axis)(\d+)([\+\-])?/);
    if (!match) return input;

    const [, joyNum, type, num, direction] = match;

    if (type === 'button') {
        return `Joystick ${joyNum}, Button ${num}`;
    } else {
        const dir = direction === '+' ? 'positive' : 'negative';
        return `Joystick ${joyNum}, Axis ${num} ${dir} (${direction === '+' ? 'push/right' : 'pull/left'})`;
    }
}

// Reset gamepad baseline state to prevent non-centered axes from triggering
function resetGamepadBaseline() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (gamepad) {
            // Set both previous (for frame-to-frame) and baseline (for total movement)
            const state_snapshot = {
                buttons: gamepad.buttons.map(b => ({ pressed: b.pressed })),
                axes: [...gamepad.axes]
            };
            state.previousGamepadState[i] = { ...state_snapshot };
            state.baselineGamepadState[i] = { ...state_snapshot };
        }
    }
}

// Configuration flow
function startConfiguration() {
    state.configuring = true;
    state.currentActionIndex = 0;
    state.furthestActionIndex = 0;  // Track starting point
    state.inputCooldown = false;

    // Initialize gamepad state to capture current axis positions
    resetGamepadBaseline();

    elements.currentActionSection.style.display = 'block';
    elements.startConfigBtn.disabled = true;
    updateCurrentAction();
    renderActionsList();
}

function nextAction() {
    // Clear any pending input when moving to next action
    state.pendingInput = null;

    // Find next unconfigured action
    let nextIndex = state.currentActionIndex + 1;
    while (nextIndex < state.actions.length && state.actions[nextIndex].binding) {
        nextIndex++;
    }

    if (nextIndex < state.actions.length) {
        state.currentActionIndex = nextIndex;

        // Track furthest action reached
        if (state.currentActionIndex > state.furthestActionIndex) {
            state.furthestActionIndex = state.currentActionIndex;
        }

        updateCurrentAction();
    } else {
        // All actions configured
        finishConfiguration();
    }

    renderActionsList();
    updateCounts();
    showResumeButtonIfNeeded();
}

// Navigate to previous action (arrow up)
function navigateToPreviousAction() {
    if (state.currentActionIndex > 0) {
        state.pendingInput = null;
        state.currentActionIndex--;
        updateCurrentAction();
        resetGamepadBaseline();
        renderActionsList();
        showResumeButtonIfNeeded();
    }
}

// Navigate to next action (arrow down)
function navigateToNextAction() {
    if (state.currentActionIndex < state.actions.length - 1) {
        state.pendingInput = null;
        state.currentActionIndex++;

        // Track furthest action reached
        if (state.currentActionIndex > state.furthestActionIndex) {
            state.furthestActionIndex = state.currentActionIndex;
        }

        updateCurrentAction();
        resetGamepadBaseline();
        renderActionsList();
        showResumeButtonIfNeeded();
    }
}

// Jump to a specific action (clicked)
function jumpToAction(index) {
    if (index >= 0 && index < state.actions.length) {
        state.pendingInput = null;
        state.currentActionIndex = index;

        // Track furthest action reached
        if (state.currentActionIndex > state.furthestActionIndex) {
            state.furthestActionIndex = state.currentActionIndex;
        }

        updateCurrentAction();
        resetGamepadBaseline();
        renderActionsList();
        showResumeButtonIfNeeded();
    }
}

// Resume from the furthest unconfigured action
function resumeConfiguration() {
    // Find next unconfigured action from furthest point
    let nextIndex = state.furthestActionIndex;
    while (nextIndex < state.actions.length && state.actions[nextIndex].binding) {
        nextIndex++;
    }

    if (nextIndex < state.actions.length) {
        jumpToAction(nextIndex);
    }
}

// Show/hide resume button based on whether user has navigated backwards
function showResumeButtonIfNeeded() {
    // Only show resume button if we've gone backwards from the furthest point
    if (state.currentActionIndex < state.furthestActionIndex) {
        // Find next unconfigured action from furthest point
        let resumeIndex = state.furthestActionIndex;
        while (resumeIndex < state.actions.length && state.actions[resumeIndex].binding) {
            resumeIndex++;
        }

        if (resumeIndex < state.actions.length) {
            elements.resumeActionNumber.textContent = resumeIndex + 1;
            elements.resumeBtn.style.display = 'inline-block';
        } else {
            elements.resumeBtn.style.display = 'none';
        }
    } else {
        elements.resumeBtn.style.display = 'none';
    }
}

function skipCurrentAction() {
    state.inputCooldown = false;
    state.pendingInput = null;  // Clear any pending input
    resetGamepadBaseline();  // Reset baseline when skipping
    nextAction();
}

function clearCurrentActionBinding() {
    if (state.currentActionIndex >= 0 && state.currentActionIndex < state.actions.length) {
        state.actions[state.currentActionIndex].binding = null;
        state.pendingInput = null;  // Clear any pending input
        elements.inputDetected.textContent = '';
        state.inputCooldown = false;
        resetGamepadBaseline();  // Reset baseline after clearing
        renderActionsList();
        updateCounts();
    }
}

function updateCurrentAction() {
    if (state.currentActionIndex >= 0 && state.currentActionIndex < state.actions.length) {
        const action = state.actions[state.currentActionIndex];
        elements.currentActionName.textContent = formatActionName(action.name);
        elements.inputDetected.textContent = action.binding || '';
        updateProgress();
    }
}

function updateProgress() {
    const configured = state.actions.filter(a => a.binding).length;
    const total = state.actions.length;
    const percentage = (configured / total) * 100;

    elements.progressText.textContent = `${configured} / ${total}`;
    elements.progressFill.style.width = `${percentage}%`;
}

function finishConfiguration() {
    state.configuring = false;
    state.currentActionIndex = -1;
    elements.currentActionSection.style.display = 'none';
    elements.startConfigBtn.disabled = false;
    elements.downloadConfigBtn.disabled = false;
    renderActionsList();
}

// UI rendering
function renderJoystickList() {
    const gamepadCount = Object.keys(state.connectedGamepads).length;

    if (gamepadCount === 0) {
        elements.joystickList.innerHTML = '<p class="no-joysticks">No joysticks detected. Connect a joystick and press any button.</p>';
    } else {
        elements.joystickList.innerHTML = Object.values(state.connectedGamepads)
            .map(gp => `
                <div class="joystick-item">
                    <div class="joystick-name">${gp.id}</div>
                    <div class="joystick-id">Joystick ${gp.index}</div>
                </div>
            `).join('');
    }
}

function renderActionsList() {
    const filteredActions = state.actions.filter((action, index) => {
        if (state.filter === 'configured') return action.binding;
        if (state.filter === 'unconfigured') return !action.binding;
        return true;
    });

    elements.actionsList.innerHTML = filteredActions.map((action, filteredIndex) => {
        const actualIndex = state.actions.indexOf(action);
        const isCurrent = actualIndex === state.currentActionIndex;
        const isConfigured = action.binding !== null;

        let classes = 'action-item clickable';
        if (isCurrent) classes += ' current';
        else if (isConfigured) classes += ' configured';

        return `
            <div class="${classes}" data-index="${actualIndex}">
                <span class="action-item-name">${formatActionName(action.name)}</span>
                <span class="action-item-binding">${action.binding || '-'}</span>
                <span class="action-item-status"></span>
            </div>
        `;
    }).join('');

    // Add click handlers to action items
    if (state.configuring) {
        elements.actionsList.querySelectorAll('.action-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                jumpToAction(index);
            });
        });
    }

    // Auto-scroll to center the current action
    if (state.currentActionIndex >= 0) {
        const currentElement = elements.actionsList.querySelector(`.action-item[data-index="${state.currentActionIndex}"]`);
        if (currentElement) {
            setTimeout(() => {
                currentElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 100);
        }
    }
}

function updateCounts() {
    const configured = state.actions.filter(a => a.binding).length;
    const unconfigured = state.actions.length - configured;

    elements.countAll.textContent = state.actions.length;
    elements.countConfigured.textContent = configured;
    elements.countUnconfigured.textContent = unconfigured;

    updateProgress();
}

function formatActionName(name) {
    // Convert CamelCase to Title Case with spaces
    return name.replace(/([A-Z])/g, ' $1').trim();
}

// Generate unique IDs (simplified GUID generation)
function generateGUID() {
    return '{' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16).toUpperCase();
    }) + '}';
}

// Config generation
function generateConfig() {
    let config = 'ActionManager {\n Actions {\n';

    state.actions.forEach(action => {
        if (action.binding) {
            const inputSourceGUID = generateGUID();
            const inputValueGUID = generateGUID();

            config += `  Action ${action.name} {\n`;
            config += `   InputSource InputSourceSum "${inputSourceGUID}" {\n`;
            config += `    Sources {\n`;
            config += `     InputSourceValue "${inputValueGUID}" {\n`;
            config += `      FilterPreset "${action.filterPreset}"\n`;
            config += `      Input "${action.binding}"\n`;

            // Add special filters for certain presets
            if (action.filterPreset === 'toggle') {
                const filterGUID = generateGUID();
                config += `      Filter InputFilterDown "${filterGUID}" {\n`;
                config += `      }\n`;
            } else if (action.filterPreset === 'hold' && (action.name.includes('Engine') || action.name.includes('ADS'))) {
                const filterGUID = generateGUID();
                config += `      Filter InputFilterHold "${filterGUID}" {\n`;
                if (action.name.includes('ADSHold')) {
                    config += `       HoldDuration -1\n`;
                }
                config += `      }\n`;
            } else if (action.name.includes('Reset')) {
                const filterGUID = generateGUID();
                config += `      Filter InputFilterSingleClick "${filterGUID}" {\n`;
                config += `      }\n`;
            } else if (action.name.includes('EngineStop')) {
                const filterGUID = generateGUID();
                config += `      Filter InputFilterHoldOnce "${filterGUID}" {\n`;
                config += `      }\n`;
            }

            config += `     }\n`;
            config += `    }\n`;
            config += `   }\n`;
            config += `  }\n`;
        }
    });

    config += ' }\n}\n';
    return config;
}

async function downloadConfig() {
    // Generate default filename based on joystick name
    let defaultName = 'customInputConfig';
    const joysticks = Object.values(state.connectedGamepads);
    if (joysticks.length > 0) {
        // Use first joystick name, sanitize it for filename
        const joystickName = joysticks[0].id
            .replace(/\s+/g, '_')  // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9_-]/g, '')  // Remove special characters
            .substring(0, 50);  // Limit length
        if (joystickName) {
            defaultName = joystickName;
        }
    }

    // Prompt user for filename
    let filename = prompt('Enter a name for your config file:', defaultName);

    // User cancelled
    if (filename === null) {
        return;
    }

    // Trim and validate filename
    filename = filename.trim();
    if (filename === '') {
        filename = defaultName;
    }

    // Ensure .conf extension
    if (!filename.endsWith('.conf')) {
        filename += '.conf';
    }

    const config = generateConfig();

    // Try to use File System Access API for better save experience
    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Arma Reforger Config',
                    accept: { 'text/plain': ['.conf'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(config);
            await writable.close();
            return;
        } catch (err) {
            // User cancelled or API not supported, fall back to regular download
            if (err.name !== 'AbortError') {
                console.error('Error using File System Access API:', err);
            }
        }
    }

    // Fallback: traditional download
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Config loading
function loadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            parseConfig(e.target.result);
            renderActionsList();
            updateCounts();
            alert('Config loaded successfully!');
        } catch (error) {
            alert('Error loading config: ' + error.message);
            console.error('Config parse error:', error);
        }
    };
    reader.readAsText(file);
}

function parseConfig(configText) {
    // Simple parser for the Arma Reforger config format
    const actionRegex = /Action\s+(\w+)\s*{[\s\S]*?Input\s+"([^"]+)"/g;
    let match;

    // Reset all bindings first
    state.actions.forEach(action => action.binding = null);

    while ((match = actionRegex.exec(configText)) !== null) {
        const actionName = match[1];
        const input = match[2];

        const action = state.actions.find(a => a.name === actionName);
        if (action) {
            action.binding = input;
        }
    }
}
