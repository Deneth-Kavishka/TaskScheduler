# MediVault Healthcare Management System - Design Guidelines

## Design Approach
**System**: Healthcare-optimized hybrid approach drawing from Linear's clarity, Notion's information hierarchy, and Apple HIG's restraint, adapted for medical context requiring trust, professionalism, and efficiency.

## Core Design Principles
1. **Medical Trust**: Clean, professional aesthetic inspiring confidence
2. **Role Clarity**: Distinct visual indicators for each user type
3. **Information Hierarchy**: Critical data prominently displayed
4. **Accessibility First**: WCAG AA compliant for all users
5. **Efficiency**: Minimize clicks for common workflows

---

## Typography System

**Primary Font**: Inter (via Google Fonts CDN)
- Headings: 600-700 weight
- Body: 400-500 weight
- Mono (for IDs/codes): 'JetBrains Mono'

**Scale**:
- Hero/Dashboard Headers: text-4xl to text-5xl (36-48px)
- Section Headers: text-2xl to text-3xl (24-30px)
- Card Titles: text-lg to text-xl (18-20px)
- Body Text: text-base (16px)
- Captions/Meta: text-sm (14px)
- Fine Print: text-xs (12px)

---

## Layout System

**Spacing Units**: Tailwind primitives - 2, 4, 6, 8, 12, 16, 24
- Consistent use of p-6/p-8 for cards
- mb-4/mb-6 for vertical rhythm
- gap-4/gap-6 for grids

**Container Strategy**:
- Dashboard: Full-width with max-w-7xl center constraint
- Forms: max-w-2xl for optimal readability
- Modals: max-w-md to max-w-lg based on content

**Grid Patterns**:
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Medical records: grid-cols-1 lg:grid-cols-3
- Appointment cards: grid-cols-1 md:grid-cols-2

---

## Component Library

### Navigation
**Top Bar** (all roles):
- Logo left, user profile/notifications right
- Role indicator badge next to user name
- Dark mode toggle prominently placed
- Quick actions dropdown

**Sidebar** (desktop):
- Persistent left sidebar (w-64)
- Icon + label navigation items
- Collapsible sections by workflow
- Active state with accent background

**Mobile Navigation**:
- Bottom tab bar for primary actions
- Hamburger menu for secondary features

### Dashboard Cards
- Rounded corners (rounded-lg)
- Subtle elevation with border
- Icon top-left, action button top-right
- Stat number large (text-3xl), label small (text-sm)
- Color-coded borders for status (green=normal, yellow=pending, red=urgent)

### Data Tables
- Alternating row background for readability
- Sticky header on scroll
- Action column always visible right
- Pagination at bottom
- Search/filter bar above table

### Forms
- Grouped by logical sections
- Labels above inputs (not floating)
- Helper text below fields
- Required field indicators (*)
- Clear error states with red accent
- Submit buttons right-aligned

### Medical Record Cards
- Patient photo thumbnail left
- Name, NIC, Health ID in header
- Tabs for History/Prescriptions/Lab Results
- Timeline view for medical notes
- Download/print actions top-right

### Prescription Display
- Large QR code center
- Medicine list in table format
- Doctor signature/stamp area
- Expiry date prominently shown
- Print/download buttons

### Appointment Cards
- Doctor photo/avatar left
- Date/time large and prominent
- Status badge (Confirmed/Pending/Completed)
- Quick actions: Reschedule/Cancel

### Modals & Overlays
- Centered with backdrop blur
- Close button top-right
- Action buttons bottom-right
- Max-height with internal scroll

### Loading States
**App Initialization**:
- Full-screen with animated medical cross icon
- Pulsing heartbeat animation
- "Loading MediVault..." text
- Progress indicator

**Component Loading**:
- Skeleton screens matching final layout
- Shimmer animation effect
- Preserve space to prevent layout shift

### Notifications
- Toast notifications top-right
- Icon indicating type (success/error/info/warning)
- Auto-dismiss after 5s
- In-app notification center with badge count

---

## Role-Specific Interfaces

**Patient Dashboard**:
- Upcoming appointments prominent
- Quick book appointment CTA
- Recent prescriptions with QR access
- Medical history timeline

**Doctor Dashboard**:
- Today's appointment queue
- Search patient (by NIC/RFID/Health ID)
- Quick prescription creation
- Lab test requests pending review

**Pharmacist Interface**:
- QR scanner prominent
- Inventory status with low-stock alerts
- Recently dispensed medicines
- Restock requests

**Lab Technician**:
- Pending tests queue
- Upload results interface
- Test history with filters

**Admin Panel**:
- User management table
- System logs viewer
- Database backup status
- Audit trail with filters

---

## Images & Media

**Hero Section** (Landing/Login):
- Large background image: Modern hospital interior or diverse medical team
- Subtle overlay for text readability
- Blurred background for login card

**Dashboard Backgrounds**:
- Subtle medical-pattern SVGs (ECG waves, molecular structures) as decorative elements
- Light opacity to not distract

**Profile Photos**:
- Circular avatars (rounded-full)
- Placeholder: Medical icon silhouette
- Upload with preview

**Background Videos** (optional for marketing pages):
- Hero section: Slow-motion hospital activity
- Muted autoplay, 15-30s loop
- Mobile: Static image fallback

**Icons**: Heroicons (via CDN)
- Outline style for navigation
- Solid style for actions/status

---

## Interaction Patterns

### Animations (minimal, purposeful)
- Page transitions: 200ms fade
- Card hover: subtle lift (transform translateY(-2px))
- Button press: scale(0.98)
- Modal entry: 300ms fade + scale
- No scroll-triggered animations

### Micro-interactions
- Success checkmark animation on form submit
- Prescription QR generation with fade-in
- Notification slide-in from right
- Loading spinner for async actions

### Dark Mode
- Toggle switch in header
- Persisted to localStorage
- Smooth transition (transition-colors duration-200)
- All components support both modes

---

## Responsive Breakpoints
- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (2 columns, simplified sidebar)
- Desktop: > 1024px (full layout, persistent sidebar)

---

## Accessibility
- All interactive elements keyboard accessible
- ARIA labels for icons/actions
- Focus visible states (ring-2 ring-offset-2)
- Color contrast meets WCAG AA
- Form error announcements
- Screen reader friendly navigation

---

## Special Features

**QR Code Integration**:
- Generate using qrcode.js library
- High error correction level
- Include prescription ID in payload
- Print-optimized sizing

**Real-time Chat**:
- Floating chat button (Patient-Doctor)
- Message bubbles with timestamps
- Typing indicators
- Unread count badge

**Notification Center**:
- Bell icon with badge count
- Dropdown list with categories
- Mark as read functionality
- Link to relevant records

**Search Functionality**:
- Global search in header
- Patient search: NIC, RFID, Health ID, Name
- Auto-suggestions as typing
- Recent searches

This design system creates a professional, trustworthy healthcare platform that balances visual appeal with functional efficiency across all user roles.