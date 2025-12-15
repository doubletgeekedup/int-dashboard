# Integration Dashboard System - Design Guidelines

## Design Approach
**System**: Custom enterprise design leveraging Radix UI primitives with warm, sophisticated branding. Drawing inspiration from Linear's information density and Notion's approachable complexity, adapted for data management workflows.

## Typography System
**Font Stack**: Inter (primary interface), JetBrains Mono (data/code displays)
- Headings: 600 weight, tight tracking (-0.02em)
- Body: 400 weight, standard line-height (1.6)
- Labels: 500 weight, uppercase, tracked (0.05em)
- Data displays: Tabular numbers, monospace for precision

## Layout & Spacing
**Spacing Scale**: Tailwind units 2, 4, 6, 8, 12, 16 for consistent rhythm
- Dashboard chrome: 4-6 unit padding
- Card spacing: 6-8 unit internal padding
- Section gaps: 8-12 unit vertical spacing
- Dense data views: 2-4 unit compact spacing

## Component Library

**Navigation**: 
- Fixed sidebar (w-64) with #27150c background, #caae8f highlights
- Top bar with breadcrumbs, search, and user controls (#fee1c2 background)
- Collapsible navigation groups with subtle #694628 dividers

**Cards**:
- Base: White background, #caae8f/10 border, 8-12 unit padding
- Shadow: Subtle elevation (shadow-sm on default, shadow-md on hover)
- Headers: #694628 text, 500 weight, with action buttons (#fcb567 accents)
- Grid layouts: 2-column (md), 3-column (lg), 4-column (xl) with gap-6

**Data Tables**:
- Sticky headers with #fee1c2 background
- Alternating row tints (#caae8f/5 on even rows)
- Hover states: #fcb567/10 background
- Compact spacing (h-12 rows) for information density

**Modals** (Radix Dialog):
- Max-width: max-w-2xl for forms, max-w-4xl for data views
- Overlay: backdrop-blur-sm with #27150c/40 tint
- Content: White with rounded-xl, shadow-2xl
- Header: #694628 text with #fcb567 accent border-b

**Forms**:
- Input fields: #fee1c2 background, #694628 border, rounded-lg
- Focus states: #fcb567 border, subtle ring
- Labels: #694628, 500 weight, mb-2
- Helper text: #caae8f, text-sm
- Submit buttons: #fcb567 primary, #694628 secondary

**Buttons**:
- Primary: #fcb567 background, white text, shadow-sm
- Secondary: #fee1c2 background, #694628 text
- Ghost: Transparent with #694628 text
- Icon buttons: rounded-lg, p-2, hover:#caae8f/20

**Status Indicators**:
- Badges: Rounded-full, px-3 py-1, using brand colors for states
- Active: #fcb567 background
- Warning: #caae8f background
- Error: #694628 background, white text

**Charts & Visualizations**:
- Use brand palette: #fcb567 (primary), #caae8f (secondary), #694628 (tertiary)
- Grid lines: #caae8f/20 for subtle reference
- Legends with clear labeling and spacing

## Dashboard-Specific Layouts

**Main Dashboard View**:
- Stats overview: 4-card row showcasing KPIs (grid-cols-4)
- Integration status grid: 3-column cards displaying connection health
- Activity feed: Single column, chronological list with timestamps
- Quick actions panel: Floating card with frequent tasks

**Empty States**:
- Include warm, minimal illustration featuring brand colors
- Centered messaging with clear CTAs using #fcb567 buttons
- Guide users toward first integration setup

**Loading States**:
- Skeleton screens using #fee1c2/30 shimmer
- Preserve layout structure during data fetching

## Responsive Behavior
- Desktop (≥1024px): Full sidebar, multi-column grids
- Tablet (768-1023px): Collapsible sidebar, 2-column grids
- Mobile (<768px): Bottom nav bar, single column, drawer navigation

## Images
**Onboarding/Empty State Illustration**: Abstract geometric composition using brand colors (#fee1c2, #fcb567, #694628) representing data flow and integration. Place in center of empty dashboard states and onboarding screens, approximately 400x300px, with surrounding whitespace.

**No hero image** - Dashboards prioritize immediate functionality over promotional content.