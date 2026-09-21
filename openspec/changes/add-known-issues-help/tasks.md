## 1. Verify facts

- [ ] 1.1 Check the Linux/Proton config path and Steam app id on a real install; note the result in #9
- [ ] 1.2 Confirm where the 32-button limit comes from (browser, driver or device mode) using a device with more than 32 buttons; note the result in #7

## 2. Write the section

- [ ] 2.1 Restructure the troubleshooting block in `src/App.vue` into symptom-grouped collapsible entries; verify each entry opens and closes
- [ ] 2.2 Write the entries for the topics listed in the design, labelling unverified ones "reported by users"; verify each topic in the design has an entry
- [ ] 2.3 Add cross-links to the device controls and the `.conf` naming reminder where relevant; verify the links work

## 3. README

- [ ] 3.1 Update the Linux path in `README.md` per 1.1 and make the app text match; verify by searching both for the old path

## 4. Verify

- [ ] 4.1 Run `npm run build` and read the section on a narrow (mobile) viewport to check it is usable
