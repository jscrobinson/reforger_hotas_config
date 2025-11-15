# Arma Reforger HOTAS Configurator

A browser-based configurator for setting up HOTAS (Hands On Throttle And Stick) controls in Arma Reforger.

---

## 🚀 **[Use the Online Tool Here →](https://hotas.deltafarce.win)**

**Don't download the files!** The configurator is ready to use online at [https://hotas.deltafarce.win](https://hotas.deltafarce.win)

No installation needed - just connect your joystick and start configuring in your browser.

---

## Features

- **Browser-Based**: No installation required - runs entirely in your web browser
- **Joystick Detection**: Automatically detects connected joysticks and game controllers
- **Interactive Configuration**: Walk through each action and assign buttons/axes
- **HAT Switch Support**: Special detection mode for HAT switches and POV controls
- **Visual Feedback**: Real-time display of configured actions with progress tracking
- **Config Generation**: Generates Arma Reforger-compatible `.conf` files
- **Smart Defaults**: Automatically names config files based on your joystick
- **Navigation**: Arrow keys and clickable actions for easy configuration editing

## Quick Start

1. Visit **[https://hotas.deltafarce.win](https://hotas.deltafarce.win)** in your browser
2. Connect your HOTAS/joystick
3. Click **"Start Configuring"**
4. Follow the prompts to assign each action
5. Press **SPACE** to confirm each input
6. Download your config when complete

## Installation

### Save Location

After downloading your config file, save it to:

```
%USERPROFILE%\Documents\My Games\ArmaReforger\profile\.save\settings\customInputConfigs
```

Or on Linux:
```
~/.local/share/bohemia interactive/arma reforger/profile/.save/settings/customInputConfigs
```

## Usage

### Configuring Actions

1. **Press or move** a button/axis on your joystick
2. **Press SPACE** to confirm the detected input
3. Use **↑/↓ arrows** to navigate between actions
4. Click any action in the list to jump to it
5. Use **Skip** to skip an action
6. Use **Clear Binding** to remove a binding

### HAT Mode

Enable **HAT Mode** for difficult HAT switches that behave unexpectedly. This uses simplified detection for discrete axis inputs.

### Resume Feature

If you navigate backward, a **Resume** button appears to jump back to where you left off.

## Configuration Actions

The configurator supports 40 actions including:

- **Character**: Fire, weapon switching, optics
- **Helicopter**: Collective, cyclic, anti-torque, brakes, lights
- **Turret**: Fire, aiming, rotation, reload
- **Voice**: VON toggle and channel
- **Utility**: Get out, map, perform action

## Technical Details

- Uses the browser's **Gamepad API** for joystick input
- Generates configs compatible with Arma Reforger's `customInputConfig.conf` format
- Supports multiple joysticks (uses `joystick0`, `joystick1`, etc.)
- Includes proper GUID generation for InputSource elements
- Implements FilterPreset system matching Arma Reforger's input manager

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (limited File System Access API support)

## Monetization

This tool includes Google AdSense integration. See `ADSENSE_SETUP.md` for setup instructions.

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Share feedback

### Running Locally for Development

If you want to contribute or run the configurator locally:

1. Clone this repository
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
4. Build for production: `npm run build`

The configurator is built with Vue 3 + TypeScript + Vite.

## License

MIT License - feel free to use and modify for your own projects.

## Credits

Created for the Arma Reforger community to make HOTAS configuration easier.

## Links

- **[HOTAS Configurator (Online Tool)](https://hotas.deltafarce.win)** ← Use this!
- [Arma Reforger Input Manager Wiki](https://community.bistudio.com/wiki/Arma_Reforger:Input_Manager)
- [Arma Reforger Official Site](https://reforger.armaplatform.com/)

## Support

If you find this tool helpful, consider sharing it with your Arma community!
