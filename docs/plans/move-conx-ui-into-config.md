# Move conx-ui Inside config/ (Private Repo)

## Context

The outer repo (`D:\HASS\core`) is **public** (`LiorZar/core.git`, a fork of `home-assistant/core`). The `conx-ui` directory currently lives at the root of this public repo. Although `.gitignore` excludes `/config`, it does **not** exclude `/conx-ui` — meaning proprietary frontend code is at risk of being committed to the public repo.

Moving `conx-ui` inside `config/` (the private `LiorZar/conx.git` repo) ensures it's protected by the inner repo's privacy boundary and the outer repo's `/config` gitignore rule.

## Steps

### 1. Move the directory

```bash
# From Git Bash
mv D:/HASS/core/conx-ui D:/HASS/core/config/conx-ui
```

### 2. Recreate hardlinks

Moving breaks the existing hardlinks (same-inode links between `conx-ui/scripts/` and `config/www/`). After the move, the `www/` files become standalone copies. Delete them and recreate hardlinks from the new location.

```bash
# Remove old standalone copies
rm D:/HASS/core/config/www/conx.js
rm D:/HASS/core/config/www/conx.js.map
rm D:/HASS/core/config/www/conx.css
rm D:/HASS/core/config/www/conxlib.js

# Create new hardlinks (Windows mklink /H syntax: mklink /H <link> <target>)
cmd //c "mklink /H D:\HASS\core\config\www\conx.js D:\HASS\core\config\conx-ui\scripts\conx.js"
cmd //c "mklink /H D:\HASS\core\config\www\conx.js.map D:\HASS\core\config\conx-ui\scripts\conx.js.map"
cmd //c "mklink /H D:\HASS\core\config\www\conx.css D:\HASS\core\config\conx-ui\scripts\conx.css"
cmd //c "mklink /H D:\HASS\core\config\www\conxlib.js D:\HASS\core\config\conx-ui\scripts\conxlib.js"
```

### 3. Add `/conx-ui` to outer `.gitignore`

Safety net — prevents accidental re-creation at the old location from being tracked.

**File:** `D:\HASS\core\.gitignore` — add after the `/config` line:

```
/conx-ui
```

### 4. Add `conx-ui/scripts/` to inner `.gitignore`

Build output in `conx-ui/scripts/` is hardlinked to `www/` (which is the tracked copy). Avoid tracking the same files twice.

**File:** `D:\HASS\core\config\.gitignore` — add:

```
conx-ui/scripts/
```

### 5. Update devcontainer mount

**File:** `D:\HASS\core\.devcontainer\devcontainer.json` line 16

```json
// Old:
"mounts": ["source=D:\\HASS\\core\\conx-ui,target=/conx-src,type=bind"],
// New:
"mounts": ["source=D:\\HASS\\core\\config\\conx-ui,target=/conx-src,type=bind"],
```

### 6. Update CLAUDE.md files (4 files)

#### 6a. `D:\HASS\core\CLAUDE.md` (outer — public repo)

- **Three Repos table:** Change UI location from `D:\HASS\core\conx-ui` to `D:\HASS\core\config\conx-ui`
- **Frontend Build section:** Update all paths from `conx-ui/` to `config/conx-ui/`
- **Hardlinks section:** Update paths (`config/conx-ui/scripts/...`)
- **Frontend Architecture heading:** Update path
- Strengthen the public/private rule to be more prominent

#### 6b. `D:\HASS\core\config\CLAUDE.md` (inner — private repo)

- Line 22: Change `D:\HASS\core\conx-ui` → `conx-ui/` (now local to the repo)
- Line 44: Update build source path
- Build commands: Update `cd` paths

#### 6c. `D:\HASS\core\config\www\CLAUDE.md`

- Line 33: Change `D:\HASS\core\conx-ui` → `config/conx-ui` (or just `../conx-ui`)
- Line 44: Update edit path

#### 6d. `D:\HASS\core\conx-ui\CLAUDE.md` (moves with the directory)

- Deployment section: hardlink path reference stays the same (`D:\HASS\core\config\www\`)
- No changes needed — paths are still correct after the move

## Files Modified

| File | Change |
|------|--------|
| `D:\HASS\core\.gitignore` | Add `/conx-ui` |
| `D:\HASS\core\config\.gitignore` | Add `conx-ui/scripts/` |
| `D:\HASS\core\.devcontainer\devcontainer.json` | Update mount path |
| `D:\HASS\core\CLAUDE.md` | Update all conx-ui paths + strengthen privacy rules |
| `D:\HASS\core\config\CLAUDE.md` | Update frontend source paths |
| `D:\HASS\core\config\www\CLAUDE.md` | Update frontend source paths |

## Verification

1. **Hardlinks work:** After step 2, run `ls -li config/www/conx.js config/conx-ui/scripts/conx.js` — inodes should match
2. **Build works:** `cd config/conx-ui && tsc` — should compile without errors
3. **Gitignore works:** `git -C config status` should NOT show `conx-ui/scripts/` as untracked
4. **Old location empty:** Confirm `D:\HASS\core\conx-ui` no longer exists
5. **HA serves correctly:** After restart, `http://localhost:8123` loads the conx UI normally
