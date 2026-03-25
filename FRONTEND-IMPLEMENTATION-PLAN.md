# Frontend Design and Implementation Plan

This plan defines how to build the frontend for the school platform using:

- Next.js (App Router)
- React Query (TanStack Query)
- shadcn/ui
- Tailwind CSS

It is aligned to the backend API already implemented in `backend`.

---

## 1) Goals

- Deliver a role-based dashboard for `SUPER_ADMIN`, `ADMIN`, `SUBJECT_TEACHER`, `CLASS_TEACHER`, `HEADTEACHER`, and `PRINCIPAL`.
- Cover core workflows end-to-end:
  - Auth and account context
  - School setup (sessions/terms/classes/subjects/assignments)
  - Student management
  - Score entry and submission
  - Class aggregation and comments
  - Leadership overview, promotions, term lock
  - Materials upload + signed download
  - Notifications
- Keep UI highly maintainable with modular features and shared data hooks.

---

## 2) Recommended frontend project structure

```txt
frontend/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── login/page.tsx
│   │   ├── (protected)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── admin/...
│   │   │   ├── students/...
│   │   │   ├── assessments/...
│   │   │   ├── class-results/...
│   │   │   ├── headteacher/...
│   │   │   ├── principal/...
│   │   │   ├── materials/...
│   │   │   └── notifications/...
│   │   ├── api/health/route.ts (optional proxy)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── tables/
│   │   ├── forms/
│   │   └── charts/
│   ├── features/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── students/
│   │   ├── assessments/
│   │   ├── classResults/
│   │   ├── leadership/
│   │   ├── materials/
│   │   └── notifications/
│   ├── lib/
│   │   ├── api/client.ts
│   │   ├── api/endpoints.ts
│   │   ├── auth/token.ts
│   │   ├── query/queryClient.ts
│   │   ├── rbac/permissions.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
└── ...
```

---

## 3) UI architecture and design system

### 3.1 Layout

- Left sidebar navigation (role-aware items).
- Top bar:
  - current term/session selector
  - user avatar + role
  - logout action
- Main content area with:
  - page title
  - breadcrumbs
  - content card sections

### 3.2 shadcn/ui components to standardize

- `Button`, `Card`, `Tabs`, `Dialog`, `Sheet`, `Badge`, `Input`, `Select`, `Textarea`
- `Table` + pagination controls
- `Form` + `react-hook-form` + `zodResolver`
- `Toast` for success/failure
- `Skeleton` for loading states
- `AlertDialog` for destructive/locking actions

### 3.3 Tailwind conventions

- Use semantic utility groupings (spacing/color/type scales).
- Keep a shared class strategy for:
  - page containers
  - section cards
  - table headers/rows
  - status badges (submitted, locked, pending, failed)

---

## 4) State management strategy

### 4.1 Server state (React Query)

- All API data lives in React Query.
- Query key convention:
  - `["auth", "me"]`
  - `["admin", "sessions"]`
  - `["students", filters]`
  - `["scoreSheets", classId, subjectId, termId]`
  - `["classResults", classId, termId]`
- Mutations invalidate only relevant keys to keep UI fast.

### 4.2 Client state

- Keep minimal local UI state:
  - modal open/close
  - selected row IDs
  - draft form values
  - temporary filters/search text

---

## 5) API integration rules

### 5.1 API client

- Central fetch wrapper:
  - reads backend base URL from env (`NEXT_PUBLIC_API_BASE_URL`)
  - adds `Authorization: Bearer <token>`
  - parses JSON
  - normalizes backend errors (`error`, `details`)

### 5.2 Auth token handling

- Store token in secure app state + persistence strategy.
- Recommended for this project phase:
  - store token in `localStorage` (MVP)
  - hydrate on app init
  - call `/api/v1/auth/me` to validate session
- For higher security later, move to httpOnly cookie flow.

### 5.3 Role/permission guard

- `me` response drives nav and route guards.
- Add a reusable permission utility:
  - `canAccess(route, role)`
  - `canViewAllClasses`
  - `isClassTeacher`

---

## 6) Role-based pages and feature mapping

### 6.1 Public

- Login page
- Bootstrap page (only shown if backend indicates empty setup flow)

### 6.2 Shared protected pages

- Dashboard (quick stats by role)
- Profile (`/api/v1/auth/me`)

### 6.3 Admin pages

- Sessions CRUD (`/api/v1/admin/sessions`)
- Terms CRUD (`/api/v1/admin/terms`)
- Classes CRUD and class teacher assignment (`/api/v1/admin/classes`)
- Subjects CRUD (`/api/v1/admin/subjects`)
- User creation (via `/api/v1/auth/register`)
- Teacher-subject assignment (`/api/v1/admin/assignments/teacher-subject`)

### 6.4 Students pages

- Student list with filters/search (`/api/v1/students`)
- Create student
- Student detail/edit

### 6.5 Assessments pages (subject teacher)

- Teaching contexts page (`/api/v1/teaching-contexts`)
- Score sheet page:
  - load rows (`GET /api/v1/score-sheets`)
  - inline edits for `test1`, `test2`, `exam`
  - save (`PUT /api/v1/score-sheets`)
  - submit/lock (`POST /api/v1/submissions`)

### 6.6 Class results pages

- Submission status (`GET /api/v1/class-results/:classId/:termId/status`)
- Aggregate trigger (`POST /aggregate`)
- Student results table (`GET /students`)
- Comments editor (`PATCH /comments`)

### 6.7 Headteacher pages

- Overview and class comparisons
- Class students with metrics
- Student performance drill-down

### 6.8 Principal pages

- Overview
- Promotions preview + approval
- Term lock action with warning confirmation

### 6.9 Materials pages

- Upload material (multipart form)
- List materials by class/subject filters
- Download action via signed URL endpoint

### 6.10 Notifications pages

- Send results-released email form
- Send low-performance alert form
- (Optional next) email logs page when backend logs endpoint is added

---

## 7) UX workflows (critical)

### 7.1 Score entry workflow

1. Teacher picks class + subject + term.
2. Sheet loads students and current scores.
3. Inline edit with numeric constraints.
4. Save mutation with optimistic disabled state.
5. Submit action locks and disables editing.

### 7.2 Aggregation workflow

1. Class teacher/headteacher triggers aggregate.
2. Show loading + success toast.
3. Refresh students table and status badges.

### 7.3 Term lock workflow

1. Principal clicks lock term.
2. AlertDialog explains irreversible effect for that term.
3. On success, surface lock badge globally for selected term.

---

## 8) Form and validation strategy

- Use `react-hook-form` + `zod`.
- Mirror backend constraints in frontend schemas (ObjectId format, score ranges, string lengths).
- Show field-level errors and server errors distinctly.

---

## 9) Data tables and charts

### 9.1 Tables

- Use shadcn table with:
  - sticky header
  - sortable key columns where useful
  - search/filter controls
  - clear empty-state messaging

### 9.2 Charts

- Add lightweight charting for leadership views:
  - class average comparison
  - pass rate trend by term
- Keep charting optional in phase 1; core tables first.

---

## 10) Error/loading/empty states

- Global loading skeletons for page-level fetches.
- Mutation-level loading on buttons.
- Consistent toast patterns:
  - success: action complete
  - error: backend `error` message
- Empty states:
  - no students
  - no assignments
  - no materials
  - no aggregates yet

---

## 11) Security and reliability concerns

- Never expose service-role keys in frontend.
- Only frontend-safe env vars should use `NEXT_PUBLIC_*`.
- Guard client routes by role, but rely on backend RBAC as source of truth.
- Handle 401 globally (clear token + redirect login).
- Handle 409 lock conflicts with user-friendly messaging.

---

## 12) Delivery phases

### Phase A: Foundation

- Next.js setup, shadcn setup, Tailwind setup
- Query client provider
- API client + auth storage
- Login + protected layout + role-based sidebar

### Phase B: Admin + students

- Sessions/terms/classes/subjects screens
- User creation + assignments
- Students list/create/edit

### Phase C: Assessments + class results

- Teaching contexts
- Score sheet editing/saving/submitting
- Class result status/aggregate/students/comments

### Phase D: Leadership

- Headteacher and principal dashboards
- Promotions preview/approve
- Term lock UX

### Phase E: Materials + notifications + polish

- Materials upload/list/download
- Notifications forms
- Shared refinement: loading/error states, responsive tweaks, accessibility pass

---

## 13) Testing strategy (frontend)

- Unit tests:
  - API client error mapping
  - permission utilities
  - schema validation helpers
- Integration tests:
  - score sheet mutation flow
  - promotion approval flow
- E2E smoke tests (Playwright):
  - login
  - admin setup path
  - score submit path
  - principal lock path

---

## 14) Immediate implementation checklist

1. Initialize `frontend` app with Next.js + TypeScript + Tailwind.
2. Install and configure shadcn/ui.
3. Install TanStack Query and providers.
4. Build auth flow (`login`, `me`, route guards).
5. Implement Admin pages first (unblocks all downstream roles).
6. Implement students + assessments.
7. Implement leadership + materials + notifications.
8. Add polish and test coverage.

---

## 15) Suggested frontend dependencies

- Core:
  - `@tanstack/react-query`
  - `react-hook-form`
  - `zod`
  - `@hookform/resolvers`
- UI:
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
  - shadcn/ui component dependencies
- Optional:
  - chart library (`recharts`) for overview pages
  - table helper (`@tanstack/react-table`) for rich grids

---

This plan is designed so you can begin implementation immediately while keeping feature parity with the current backend APIs.
