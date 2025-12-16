# Swisscom Color Palette 🎨

This document outlines the official Swisscom color palette used in Bonify.

## Primary Colors

### Dark Navy (Background)
- **HEX**: `#040d33`
- **RGB**: 4, 13, 51
- **Usage**: Main background, dark surfaces

### Navy (Header & Cards)
- **HEX**: `#001155`
- **RGB**: 0, 17, 85
- **Usage**: Header bar, card backgrounds, containers

### Blue (Primary Actions)
- **HEX**: `#0445c8`
- **RGB**: 4, 69, 200
- **Usage**: Borders, primary button, accents

### Azur (Interactive Elements)
- **HEX**: `#0e6eec`
- **RGB**: 14, 110, 236
- **Usage**: Icons, current tier highlights, button gradient

### Light Blue (Text & Accents)
- **HEX**: `#11aaff`
- **RGB**: 17, 170, 255
- **Usage**: Labels, secondary text, tier indicators

### Turquoise (Success & Money)
- **HEX**: `#00a3bf`
- **RGB**: 0, 163, 191
- **Usage**: Earnings, bonus amounts, success states

## Accent Colors

### Red (Errors)
- **HEX**: `#f20505`
- **RGB**: 242, 5, 5
- **Usage**: Error messages, alerts

### White
- **HEX**: `#ffffff`
- **RGB**: 255, 255, 255
- **Usage**: Primary text, headings, icons

## Color Application

### Background Layers
```
Level 1 (Deepest):  #040d33 - Main background
Level 2:            #001155 - Cards & containers
Level 3:            #0445c8/30 - Hover states, highlights
```

### Text Hierarchy
```
Primary:    #ffffff     - Headings, important text
Secondary:  #11aaff     - Labels, secondary info
Tertiary:   #ffffff/70  - Descriptions, helper text
Disabled:   #ffffff/30  - Locked states
```

### Interactive Elements
```
Primary Button:     #0445c8 → #0e6eec (gradient)
Button Hover:       scale(1.05)
Button Active:      scale(0.95)
Button Shadow:      0 10px 30px rgba(4, 69, 200, 0.5)
```

### Borders
```
Strong:     #0445c8/50  - Active cards
Medium:     #0445c8/30  - Default borders
Subtle:     #0445c8/20  - Inactive elements
```

### Status Colors
```
Success/Earned:     #00a3bf (Turquoise)
Progress:           #0e6eec (Azur)
Current:            #0e6eec (Azur) - Background
Error:              #f20505 (Red)
Locked:             #ffffff/30 (Dimmed white)
```

## Component-Specific Usage

### Header Bar
- Background: `#001155`
- Border: `#0445c8/30`
- Text: `#ffffff` (name), `#11aaff` (tier)

### Stats Cards
- Background: `#001155`
- Border: `#0445c8/30`
- Icon Colors:
  - Contracts: `#11aaff` (Light Blue)
  - Earned: `#00a3bf` (Turquoise)
  - Remaining: `#0e6eec` (Azur)

### Counter Button
- Gradient: `#0445c8` → `#0e6eec`
- Shadow: `rgba(4, 69, 200, 0.5)`
- Size: 128×128px
- Icon: White (+)

### Progress Card
- Background: `#001155`
- Border: `#0445c8/30`
- Label: `#11aaff`
- Value: `#ffffff`
- Bonus: `#00a3bf`

### Performance Levels
- **Current Level**:
  - Background: `#001155`
  - Border: `#0e6eec` (2px)
  - Badge: `#0e6eec` background
  
- **Unlocked Level**:
  - Background: `#001155`
  - Border: `#0445c8/50`
  - Icon: `#11aaff`
  - Amount: `#00a3bf`
  
- **Locked Level**:
  - Background: `#001155/50`
  - Border: `#0445c8/20`
  - Icon: `#ffffff/30`
  - Amount: `#ffffff/30`

### Login Page
- Background: `#040d33`
- Card: `#001155`
- Logo Circle: `#0445c8` → `#0e6eec` gradient
- Error: `#f20505` with 10% opacity background

## Design Principles

1. **Corporate Identity**: Uses official Swisscom colors throughout
2. **Hierarchy**: Clear distinction between levels using opacity and color
3. **Consistency**: Same colors mean the same thing everywhere
4. **Accessibility**: High contrast ratios on dark backgrounds
5. **Professional**: Clean, minimal, work-appropriate design

## Color Psychology

- **Dark Navy/Blue**: Trust, professionalism, stability
- **Light Blue**: Communication, clarity, technology
- **Turquoise**: Success, achievement, positive outcomes
- **White**: Clarity, simplicity, information
- **Red**: Urgency, errors, attention (used sparingly)

## Mobile Optimization

- All colors tested for readability on small screens
- Touch targets maintain visibility with borders
- No reliance on color alone (icons + text)
- High contrast maintains legibility in various lighting
