# ConX UI Facelift: Glassmorphism + Cyan/Teal

## Context

The ConX frontend uses a dark theme with orange accent, gradient-heavy skeuomorphic buttons (diagonal dark-to-light sweeps), heavy inner/outer shadows for 3D depth, and pill-shaped borders. This looks dated. The goal is a flat, futuristic, modern UI using glassmorphism (frosted glass effect) with a cyan/teal accent on a dark navy background.

**Approach**: CSS variables + TS inline style defaults (Approach B). Update `conx.css` and ~14 TS files that hardcode gradient/color values. No architectural changes.

## Color Palette

| Token | Old Value | New Value | Usage |
|-------|-----------|-----------|-------|
| Background | `#2a2a2e` | `#1a1a2e` | Page/card background |
| Surface | `#000` gradients | `rgba(255,255,255,0.06)` | Button/control fill (glass) |
| Surface hover | lighter gradient | `rgba(255,255,255,0.10)` | Hover state |
| Surface active | `#808080->#000` | `rgba(0,229,255,0.15)` | Pressed (cyan tint) |
| Accent | `#ff8c00` | `#00e5ff` | Selected, active, progress |
| Accent gradient | `#ff8c00->#ffb347` | `#00bcd4->#00e5ff` | Slider progress, knob arc |
| Selected bg | `orange` | `rgba(0,229,255,0.25)` | Selected buttons |
| Focus ring | `rgba(255,165,0,0.35)` | `rgba(0,229,255,0.35)` | Focus-visible outline |
| Border | none / `#000` | `rgba(255,255,255,0.12)` | Glass edge |
| Text primary | `#fff` | `rgba(255,255,255,0.92)` | No change |

## Glassmorphism Recipe

### Standard Buttons (radio, dimmer, standalone)

```css
background: rgba(255, 255, 255, 0.06);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 8px;
box-shadow: none;
```

### Dense Grid Buttons (numpad, softkeys, radio groups)

Reduced intensity for readability at tight spacing:

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(6px);
-webkit-backdrop-filter: blur(6px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 6px;
```

### Button States

| State | Background | Border | Extra |
|-------|-----------|--------|-------|
| Normal | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.12)` | -- |
| Hover | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.15)` | -- |
| Active | `rgba(0,229,255,0.15)` | `rgba(0,229,255,0.3)` | `translateY(1px)` |
| Selected | `rgba(0,229,255,0.25)` | `rgba(0,229,255,0.5)` | `box-shadow: 0 0 8px rgba(0,229,255,0.2)` |
| Disabled | same as normal | same | `opacity: 0.4` |

## Controls

### Slider
- Track bg: `#1a1a2e` with existing inset shadow
- Progress: `linear-gradient(90deg, #00bcd4, #00e5ff)`
- Thumb: `#f0f0f0` with `0 0 6px rgba(0,229,255,0.5)` cyan glow
- Frame: `1px solid rgba(255,255,255,0.10)`
- Radius: `4px` (unchanged)

### Toggle
- On: `#00e5ff`
- Off: `rgba(255,255,255,0.08)`
- Thumb: `#f0f0f0` (unchanged)
- Radius: `20px` (unchanged, pill is correct for toggles)

### WheelKnob
- Arc color: `#00e5ff`
- Background: `#1a1a2e`
- Frame: `rgba(255,255,255,0.08)`
- Center: keep existing radial-gradient, just recolor
- Shadow: keep `0 2px 12px rgba(0,0,0,0.5)` (physical metaphor)

### Color Sliders (RGB/HSV)
Per-channel colors (red, green, blue, hue image) stay as-is. Only accent/default colors change.

## Files to Modify

All paths relative to `config/conx-ui/`:

| File | Changes |
|------|---------|
| `scripts/conx.css` | All CSS variables + `.conx-radio`, `.conx-dimmer-bn`, `.conx-dimmer-bn-simple` rewritten |
| `conx/cards/numpad.ts` | Hardcoded gradient `css.bn` / `css["bn-down"]` defaults |
| `conx/cards/radio.ts` | `getStubConfig()` gradient defaults, state class styles |
| `conx/cards/softkeys.ts` | Button CSS defaults |
| `conx/cards/softkeysCues.ts` | Button CSS defaults |
| `conx/cards/softkeysTimelines.ts` | Button CSS defaults |
| `conx/cards/softkeysbase.ts` | Base softkey styling |
| `conx/cards/dimmer.ts` | `dimmerColor` default `[1,1,0]` -> `[0,0.9,1]` (cyan) |
| `conx/cards/swatch.ts` | Hardcoded button CSS defaults |
| `conx/cards/live.ts` | Button CSS defaults |
| `conx/cards/HACard.ts` | Accent references if any |
| `conx/controls/slider.ts` | Default progress color if inline |
| `conx/controls/toggle.ts` | `onBG`/`offBG` defaults if inline |
| `conx/controls/wheel-knob.ts` | Arc color default if inline |

## Not Changing

- Component architecture, event handling, lifecycle
- `glo.ts` utility functions
- Card configs / YAML format
- Per-card `css:{}` override system (still works)
- RGB/HSV functional colors on light cards
- Font stack, text sizes
- Spacing (1-2px gaps preserved)

## Verification

1. Run `tsc` in `config/conx-ui/` -- must compile clean
2. Open HA at `http://localhost:8123` and navigate to ConX views
3. Verify visually:
   - Buttons show frosted glass effect (semi-transparent, blurred)
   - Cyan accent on selected/active states
   - Sliders show teal-to-cyan progress gradient
   - Toggle on-state is cyan
   - Numpad/softkey grids render with reduced-intensity glass
   - WheelKnob arc is cyan
   - Dark navy background throughout
4. Test on mobile viewport (ConX is mobile-first) -- check `backdrop-filter` performance
5. Verify per-card `css:{}` overrides still apply correctly (test a radio card with custom styling)
