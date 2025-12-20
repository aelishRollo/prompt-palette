# Prompt Palette UX Audit

## Executive Summary
Prompt Palette has solid core functionality but several UX friction points that prevent it from being "sleek, intuitive, and highly powerful while just working." This audit identifies critical issues and proposes actionable improvements.

---

## 🔴 Critical Issues

### 1. **Keyboard Macros Don't Work Globally**
**Problem**: Shortcuts only trigger when the popup is already open, defeating their purpose.
- Users expect Ctrl+Alt+P to copy a prompt from *anywhere* in the browser
- Current implementation only checks shortcuts within the popup window
- This makes the feature nearly useless for its intended quick-access purpose

**Impact**: High - Makes the new keyboard macro feature essentially non-functional for real workflows

**Solution**:
- Use Chrome's `commands` API to register global shortcuts
- Store shortcuts in chrome.storage and register them as extension commands
- Or use content scripts to listen for shortcuts on active tabs

---

### 2. **Visual Clutter - 4 Buttons Per Prompt**
**Problem**: Each prompt displays 4 action buttons vertically, creating visual noise.
```
[Prompt text here]
[Set Shortcut]
[Add Tag    ]
[Edit       ]
[Delete     ]
```

**Impact**: Medium-High - Makes the interface feel busy and overwhelming, especially with many prompts

**Improvement Ideas**:
- Use a single "⋮" menu button that reveals actions on click/hover
- Show only primary action (select prompt), reveal others on hover
- Use icon buttons instead of text buttons to save space
- Consider a compact horizontal layout

---

### 3. **Tags Not Visible on Prompts**
**Problem**: You can't see what tags are assigned to a prompt without clicking "Add Tag"
- Tags are a categorization feature but aren't displayed
- Users must open the add tag dialog to discover existing tags

**Impact**: Medium - Reduces utility of the tag system

**Solution**: Display tags as small badges below or next to the prompt text
```
[Prompt text here] [Ctrl+Alt+P]
#coding #javascript
```

---

### 4. **No Tag Management**
**Problem**: Can add tags but can't remove them without editing
- No visual representation of tags on prompts
- No click-to-remove functionality
- Can't edit the full tag list for a prompt

**Impact**: Medium - Makes tag system feel half-baked

**Solution**:
- Display tags as dismissible badges with × button
- Or add tag management to the edit dialog

---

### 5. **Alert() for Error Messages**
**Problem**: Using `alert()` for duplicate shortcut validation (popup.ts:160)
- Blocks the UI
- Feels dated and jarring
- Breaks the modern design aesthetic

**Impact**: Low-Medium - Poor error UX

**Solution**: Use inline error messages or toast notifications

---

## ⚠️ Major UX Friction

### 6. **Window Auto-Close on Blur**
**Problem**: Extension closes when you click outside (popup.ts:372-374)
- Frustrating if you accidentally click away
- Only prevented when kebab menu is clicked
- Help menu doesn't prevent closure

**Impact**: Medium - User frustration

**Considerations**:
- Should this be configurable?
- Should certain actions (like having selections) prevent auto-close?
- Help menu should definitely prevent closure

---

### 7. **No Undo/Recovery**
**Problem**: Deleted prompts are gone forever
- No confirmation dialog shows the prompt being deleted
- No undo functionality
- Accidental deletes are unrecoverable

**Impact**: Medium - Data loss risk

**Solution**:
- Show the actual prompt text in the delete confirmation
- Add "Recently Deleted" feature (trash)
- Or add Ctrl+Z undo support

---

### 8. **Keyboard Shortcut Capture UX**
**Problem**: The shortcut input is readonly with placeholder "Press keys..."
- Not immediately obvious you should just press keys
- No visual feedback while capturing
- Can't manually type a shortcut if needed

**Impact**: Low-Medium - Confusion for new users

**Improvements**:
- Add clearer instructions: "Press any key combination now"
- Show visual feedback when keys are detected
- Highlight the input field during capture
- Add example shortcuts

---

### 9. **Hidden Features - Poor Discoverability**

**Problem**: Key features are hidden or undiscoverable:
- **Apostrophe (') key** for multi-select - nowhere documented in UI
- **Tag filtering** - hidden until you click "Filter Prompts"
- **Import/Export** - buried in kebab menu
- **Keyboard navigation** - not obvious

**Impact**: High - Users won't discover power features

**Solutions**:
- Add subtle keyboard hints in UI
- First-time user onboarding
- Tooltips on hover
- Update help menu with all features

---

### 10. **Help Menu Issues**
**Problem**:
- Takes up 538px × 600px (popup.html:239) - massive overlay
- Doesn't mention keyboard macros feature
- Blocks entire interface
- Not searchable or scannable

**Impact**: Medium - Help is hard to use

**Improvements**:
- Add keyboard macros to help text
- Make it scrollable with sections
- Or link to external documentation
- Add "?" tooltips inline instead

---

## 🟡 Polish & Enhancement Opportunities

### 11. **No Empty State Guidance**
**Problem**: When there are no prompts, just shows empty list
- New users see blank interface
- No call-to-action or guidance

**Solution**: Add friendly empty state with instructions

---

### 12. **No Search/Filter for Prompts**
**Problem**: With many prompts, finding one is difficult
- Only filtering is by tags
- No text search
- No fuzzy finding

**Impact**: Medium - Scales poorly

**Solution**: Add search input at top to filter by text

---

### 13. **Shortcut Badge Placement**
**Current**: `<span>${prompt.text} ${shortcutDisplay}</span>` (popup.ts:79)
- Badge appears inline with text
- Could break long text formatting

**Suggestion**: Position badge separately (absolute positioning)

---

### 14. **No Visual Feedback on Actions**
**Problem**: Many actions happen silently:
- Adding a prompt - no confirmation
- Importing prompts - no feedback
- Copying prompts - notification appears but very brief

**Solution**: Add subtle success indicators (checkmarks, toasts)

---

### 15. **Prompt Input Doesn't Clear on Error**
**Problem**: If you add empty prompt (popup.ts:108-116), input doesn't clear
- No error message shown
- User might think something is broken

**Solution**: Show "Prompt cannot be empty" message

---

### 16. **Multi-Select Not Obvious**
**Problem**: Selected prompts show blue background (#9bb7ff) but:
- Not clear that multiple selection is happening
- No counter showing "3 prompts selected"
- Selected state could be more prominent

**Solution**:
- Add selection counter
- More prominent selected state
- Checkbox-style selection indicators

---

### 17. **Export Filename Not Configurable**
**Problem**: Always exports as "prompts.json" (popup.ts:318)
- Can't include date or custom name
- Will overwrite previous exports

**Solution**: Add timestamp or let user choose filename

---

### 18. **Import Has No Preview**
**Problem**: Import immediately merges data
- Can't see what will be imported
- No validation shown
- No way to review changes

**Solution**: Show preview dialog before import

---

### 19. **Window Sizing Issues**
**Problem**: Window resizes to 35% width (popup.ts:333)
- Hardcoded percentage might not work well on all screens
- Very wide on large monitors
- Too narrow on small screens

**Solution**: Use min/max constraints with percentage

---

### 20. **Debug Logging in Production**
**Problem**: Multiple console.log statements throughout:
- Lines 46, 54, 56, 235, 237, 250, 411 in popup.ts
- Should be removed for production

**Impact**: Low - Console noise

---

### 21. **No Keyboard Shortcut Conflicts Check**
**Problem**: Extension shortcuts might conflict with:
- Browser shortcuts
- Other extension shortcuts
- Webpage shortcuts

**Solution**: Warn about common conflicts (Ctrl+P, Ctrl+T, etc.)

---

### 22. **Copy Behavior Adds Extra Newlines**
**Problem**: `'\n\n' + selectedPrompts.join('\n\n')` (popup.ts:159)
- Adds 2 newlines before content
- Might not be desired for all use cases

**Consideration**: Make configurable or explain why

---

### 23. **No Prompt Reordering**
**Problem**: Prompts appear in the order added
- Can't prioritize frequently used prompts
- No drag-and-drop reordering
- No sorting options

**Impact**: Medium - Reduces efficiency with many prompts

---

### 24. **Button Text Inconsistency**
**Problem**: Some dialogs say "Yes/No", others say "Save/Cancel"
- Delete dialog: "Yes/No" (popup.html:78-79)
- Edit dialog: "Save/Cancel" (popup.html:87-88)
- Add tag: "Add Tag/Cancel" (popup.html:96-97)

**Solution**: Standardize to action-based labels

---

### 25. **No Success State for Shortcut Assignment**
**Problem**: After setting a shortcut, dialog just closes
- No "Shortcut saved!" confirmation
- User has to look for badge to confirm

**Solution**: Brief success message or animation

---

## 🟢 Accessibility Issues

### 26. **Keyboard Navigation Gaps**
- Can navigate prompts with arrows but can't activate buttons with keyboard
- Tab order not optimized
- Focus styles could be more prominent
- Dialog escape key handling not implemented

---

### 27. **Color Contrast**
- Shortcut badge purple (#9b59b6) on white - check WCAG AA compliance
- Selected state (#9bb7ff) - check contrast ratios
- Button text on colored backgrounds

---

### 28. **Screen Reader Support**
- Dialogs should have aria-describedby
- Buttons should have aria-labels for icon buttons
- Success/error messages should be announced

---

## 🎨 Design/Polish

### 29. **Inconsistent Spacing**
- Header has 100px height but varies (style.css:36)
- Margins and paddings not using consistent scale
- Button gaps inconsistent

---

### 30. **Button Shadow Animation**
**Current**: Buttons have 3D shadow effect that moves on click
- `box-shadow: 0px 5px 0px...` (style.css:68)
- `top: 6px` on active (style.css:73)

**Issue**: `top: 6px` without position: relative has no effect
- The shadow animation won't work as intended

---

## 💡 Quick Wins (Easy High-Impact Fixes)

1. **Add keyboard macros to help menu** - 2 min fix
2. **Display tags on prompts** - 15 min
3. **Remove console.log statements** - 5 min
4. **Fix delete confirmation to show prompt text** - 5 min
5. **Add empty state message** - 10 min
6. **Replace alerts with inline errors** - 20 min
7. **Fix button position for shadow animation** - 2 min
8. **Add prompt search** - 30 min
9. **Show selection counter** - 10 min
10. **Add escape key to close dialogs** - 15 min

---

## 🚀 High-Impact Features (Require More Work)

1. **Global keyboard shortcuts** - Critical but complex (requires Chrome API)
2. **Compact button layout** - Menu or icon-based
3. **Tag management UI** - Show and remove tags
4. **Prompt search/fuzzy find** - Essential for scaling
5. **Undo functionality** - Data safety
6. **Import preview** - Better data control

---

## Prioritized Roadmap

### Phase 1: Critical Fixes (Make it work)
- Fix global keyboard shortcuts
- Remove console.logs
- Replace alerts with better errors
- Update help menu with all features

### Phase 2: Polish (Make it intuitive)
- Display tags on prompts
- Add search functionality
- Compact button layout
- Improve empty states
- Fix keyboard navigation

### Phase 3: Power Features (Make it powerful)
- Tag management (add/remove easily)
- Prompt reordering
- Undo system
- Import preview
- Advanced filtering

### Phase 4: Delight (Make it sleek)
- Smooth animations
- Keyboard hints/tooltips
- Onboarding flow
- Themes/customization
