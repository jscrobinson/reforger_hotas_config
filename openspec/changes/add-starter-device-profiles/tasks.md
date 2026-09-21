## 1. Manifest

- [ ] 1.1 Create `public/vanilla_configs/profiles.json` with entries for the two existing profiles; verify it is valid JSON and served by the dev server
- [ ] 1.2 Load the manifest at start and render the buttons from it, with a fall back to the current two; verify the buttons match the manifest and still work with the manifest removed

## 2. Loading behaviour

- [ ] 2.1 Show the description details for each profile; verify all four details render
- [ ] 2.2 Ask before replacing existing bindings and show the device-count notice; verify with one connected device and a two-device profile

## 3. Contributions

- [ ] 3.1 Write the contribution note (in `README.md` or a `CONTRIBUTING.md`) with the three conditions; verify it links from the app's profile list or README
- [ ] 3.2 Run `npm run build` and verify the manifest and `.conf` files are in `dist`
