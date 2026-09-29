# Accessibility & inclusion

The Market serves everyone in the village: older neighbours, kids, people using assistive tech, and shoppers paying with SNAP/EBT. The system's defaults hold that line.

- **Contrast.** Every text token's usage note names the grounds it reads on at ≥ 4.5:1 in both themes. `hairline` and `glass` are decorative. Control edges use `border-control` (≥ 3:1).
- **Script is decoration.** Never put information only in Yellowtail. The facts live in the display title or the body copy.
- **Condensed caps.** League Gothic is used only at 26px and up. Screen readers get sentence-case text, because CSS applies the uppercase.
- **Never colour alone.** Status, category and market identity always carry a word, and notices carry an icon and a title.
- **Focus.** Keep the 3px `focus` ring with its 2px offset, and never remove it.
- **Touch.** Targets are at least 44px (buttons are 48px), with `space-2` or more between them.
- **Forms.** Every field has a visible label. The hint sits under the label and errors in `heirloom-text` say how to fix the problem.
- **Illustrations** are `aria-hidden` unless they carry meaning. Logos have the accessible name "Whitefish Bay Farmers Market".
- **Motion.** Keep hover lifts short and switch them off under `prefers-reduced-motion`. Nothing auto-plays.
- **Food access.** SNAP/EBT information is one tap from every page (it's in the utility bar) and never asks anyone to identify themselves publicly.
