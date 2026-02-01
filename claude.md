# Lifting Diary Course Project

## Overview
A Next.js application for tracking weightlifting workouts and progress over time.

## Tech Stack
- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5
- **UI**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Font**: Geist (Sans & Mono)

## 🚨 CRITICAL: Coding Standards & Documentation

**MANDATORY FOR ALL CODE GENERATION:**

When creating or modifying ANY code in this project, you MUST:

1. **ALWAYS refer to the relevant documentation files in the `/docs` directory**
2. **STRICTLY follow all standards outlined in these documents**
3. **Review the appropriate doc file BEFORE writing any code**

### Documentation Files

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `docs/ui.md` | UI coding standards, component usage, date formatting | **EVERY TIME** you create UI components, forms, or handle dates |
| `docs/data-fetching.md` | Data fetching standards, database queries, user data isolation | **EVERY TIME** you fetch data, query the database, or create data access functions |

### Enforcement

- ⛔ **NO code should be written without first consulting the relevant docs**
- ⛔ **ALL code must comply with the standards in `/docs`**
- ⛔ **Non-compliant code will be rejected immediately**

### Before Writing Code - Checklist

- [ ] Identified which doc files are relevant to my task
- [ ] Read and understood the applicable standards
- [ ] Verified my implementation follows ALL documented rules
- [ ] Double-checked for any violations (e.g., custom components, wrong date format)

## Project Status
- [x] Project initialized with create-next-app
- [x] Development server running on http://localhost:3000
- [ ] Core features to be implemented

## Planned Features

### Phase 1: Basic Tracking
- [ ] Home page with workout overview
- [ ] Exercise database/library
- [ ] Workout logging form
- [ ] Basic workout history view

### Phase 2: Progress Tracking
- [ ] Exercise progress charts
- [ ] Personal records (PRs) tracking
- [ ] Workout statistics
- [ ] Calendar view of workouts

### Phase 3: Advanced Features
- [ ] Workout templates
- [ ] Exercise notes and form cues
- [ ] Progress photos
- [ ] Data export/import

## Development Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Notes
- Project created: January 7, 2026
- Current phase: Initial setup complete, ready for feature development
