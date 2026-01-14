# UI Coding Standards

## Overview
This document outlines the mandatory UI development standards for the Lifting Diary Course project. All developers must strictly adhere to these guidelines to ensure consistency and maintainability across the application.

---

## Component Library

### shadcn/ui Components - MANDATORY

**CRITICAL RULE: Only shadcn/ui components shall be used throughout this project.**

- **NO custom UI controls are permitted**
- **NO alternative component libraries are allowed**
- **ALL UI elements must come from shadcn/ui**

### Available shadcn/ui Components

When building UI features, utilize only the following shadcn/ui components:

- **Forms**: Button, Input, Textarea, Select, Checkbox, Radio Group, Switch, Label
- **Data Display**: Table, Card, Badge, Avatar, Separator
- **Feedback**: Alert, Alert Dialog, Toast, Dialog, Progress, Skeleton
- **Navigation**: Tabs, Dropdown Menu, Command, Navigation Menu
- **Layout**: Sheet, Accordion, Collapsible, Scroll Area
- **Date/Time**: Calendar, Date Picker, Popover (for date pickers)

### Installing shadcn/ui Components

Use the official CLI to add components:

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add calendar
```

### Component Documentation

Refer to the official documentation for usage guidelines:
- **Documentation**: https://ui.shadcn.com/
- **Examples**: https://ui.shadcn.com/examples

---

## Date Formatting Standards

### Date Library: date-fns

**ALL date formatting operations must use `date-fns`.**

#### Installation

```bash
npm install date-fns
```

#### Standard Date Format

**MANDATORY FORMAT: `dd/MM/yyyy`**

This format must be used consistently throughout the entire application for displaying dates to users.

#### Implementation Examples

```typescript
import { format } from 'date-fns';

// Correct usage
const formattedDate = format(new Date(), 'dd/MM/yyyy');
// Output: "14/01/2026"

// Formatting a specific date
const workoutDate = new Date('2026-01-14');
const displayDate = format(workoutDate, 'dd/MM/yyyy');
// Output: "14/01/2026"
```

#### Common Date Operations

```typescript
import { format, parseISO, isValid, addDays, subDays } from 'date-fns';

// Parsing ISO strings from database
const date = parseISO('2026-01-14T10:30:00Z');
const formatted = format(date, 'dd/MM/yyyy');

// Validating dates
if (isValid(date)) {
  const formatted = format(date, 'dd/MM/yyyy');
}

// Date arithmetic
const tomorrow = format(addDays(new Date(), 1), 'dd/MM/yyyy');
const yesterday = format(subDays(new Date(), 1), 'dd/MM/yyyy');
```

#### Additional Format Patterns (When Needed)

While `dd/MM/yyyy` is the standard, these patterns may be used in specific contexts:

- **Time**: `HH:mm` (24-hour format) or `h:mm a` (12-hour with AM/PM)
- **Date with Time**: `dd/MM/yyyy HH:mm`
- **Month Year**: `MMMM yyyy` (e.g., "January 2026")
- **Relative Dates**: Use `formatDistance`, `formatRelative` from date-fns

```typescript
import { formatDistance, formatRelative } from 'date-fns';

// Relative time
const timeAgo = formatDistance(pastDate, new Date(), { addSuffix: true });
// Output: "2 days ago"

// Relative date
const relativeDate = formatRelative(date, new Date());
// Output: "yesterday at 10:30 AM"
```

---

## Enforcement

### Code Review Checklist

Before submitting any PR, verify:

- [ ] All UI components are from shadcn/ui
- [ ] No custom controls have been created
- [ ] No alternative component libraries are imported
- [ ] All dates are formatted using date-fns
- [ ] Standard date format `dd/MM/yyyy` is used for display

### Violations

Any code that violates these standards will be **rejected immediately** and must be refactored before merging.

---

## Examples

### ✅ CORRECT Implementation

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export function WorkoutForm() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div>
      <Input placeholder="Exercise name" />
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
      />
      <p>Selected: {format(date, 'dd/MM/yyyy')}</p>
      <Button>Save Workout</Button>
    </div>
  );
}
```

### ❌ INCORRECT Implementation

```typescript
// WRONG: Custom button component
export function CustomButton() {
  return <button className="custom-btn">Click me</button>;
}

// WRONG: Using moment.js
import moment from 'moment';
const date = moment().format('DD/MM/YYYY');

// WRONG: Manual date formatting
const date = new Date().toLocaleDateString();

// WRONG: Using Material-UI or other libraries
import { Button } from '@mui/material';
```

---

## Additional Resources

### shadcn/ui
- Official Website: https://ui.shadcn.com/
- GitHub: https://github.com/shadcn-ui/ui
- Discord: https://discord.gg/shadcn

### date-fns
- Official Website: https://date-fns.org/
- Documentation: https://date-fns.org/docs/
- GitHub: https://github.com/date-fns/date-fns

---

## Questions?

If you need a UI component that doesn't exist in shadcn/ui, please:
1. Check if it can be composed from existing shadcn/ui components
2. Request a discussion with the team before proceeding
3. **Never create custom components without explicit approval**

---

**Last Updated**: January 14, 2026
**Version**: 1.0
