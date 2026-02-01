# Data Fetching Standards

## 🚨 CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

### ✅ ALLOWED
- Server Components (async components in `/app` directory)
- Server Actions (for mutations)

### ⛔ STRICTLY FORBIDDEN
- ❌ Route Handlers (API routes)
- ❌ Client Components with `useEffect` + fetch
- ❌ Client-side data fetching libraries (React Query, SWR, etc.)
- ❌ Any other client-side data fetching method

## Why Server Components Only?

1. **Security**: Database credentials never exposed to client
2. **Performance**: No client-side JavaScript needed for data fetching
3. **Data Isolation**: Server-side user authentication guarantees data access control
4. **Simplicity**: Direct database access without API layer overhead
5. **Type Safety**: Full TypeScript types from database to UI

## Data Access Pattern

### 1. Database Queries via `/data` Directory

**ALL database queries MUST be implemented as helper functions in the `/data` directory.**

```
/data
  ├── workouts.ts       # Workout-related queries
  ├── exercises.ts      # Exercise-related queries
  ├── users.ts          # User-related queries
  └── ...
```

### 2. Use Drizzle ORM Only

**⛔ NEVER use raw SQL queries.**

**✅ ALWAYS use Drizzle ORM.**

#### ❌ WRONG - Raw SQL
```typescript
// NEVER DO THIS
const workouts = await db.execute(
  sql`SELECT * FROM workouts WHERE user_id = ${userId}`
);
```

#### ✅ CORRECT - Drizzle ORM
```typescript
// ALWAYS DO THIS
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

const userWorkouts = await db
  .select()
  .from(workouts)
  .where(eq(workouts.userId, userId));
```

## 🔒 User Data Isolation - CRITICAL

**Users MUST ONLY be able to access their own data.**

### Mandatory User ID Filtering

**EVERY database query MUST include user ID filtering.**

#### ❌ WRONG - No User Filtering
```typescript
// SECURITY VULNERABILITY - Returns ALL users' data
export async function getWorkouts() {
  return await db.select().from(workouts);
}
```

#### ✅ CORRECT - User ID Required
```typescript
// SECURE - Only returns authenticated user's data
export async function getWorkouts(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

### Authentication in Server Components

Always get the authenticated user ID before fetching data:

```typescript
import { auth } from "@/auth"; // or your auth solution
import { getWorkouts } from "@/data/workouts";

export default async function WorkoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workouts = await getWorkouts(session.user.id);

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

## File Structure Example

### `/data/workouts.ts`
```typescript
import { db } from "@/db";
import { workouts, workoutExercises } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get all workouts for a specific user
 * @param userId - The authenticated user's ID
 */
export async function getWorkouts(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(desc(workouts.startTime));
}

/**
 * Get a single workout with exercises
 * @param workoutId - The workout ID
 * @param userId - The authenticated user's ID (for security)
 */
export async function getWorkoutById(workoutId: string, userId: string) {
  const workout = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId) // CRITICAL: Always filter by userId
      )
    )
    .limit(1);

  if (!workout[0]) {
    return null;
  }

  const exercises = await db
    .select()
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  return {
    ...workout[0],
    exercises,
  };
}
```

### Server Component Usage
```typescript
// app/workouts/page.tsx
import { auth } from "@/auth";
import { getWorkouts } from "@/data/workouts";
import { redirect } from "next/navigation";

export default async function WorkoutsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch data directly in server component
  const workouts = await getWorkouts(session.user.id);

  return (
    <div>
      <h1>My Workouts</h1>
      {workouts.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  );
}
```

## Data Mutations (Server Actions)

For creating, updating, or deleting data, use Server Actions:

### `/data/workouts.ts`
```typescript
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@/auth";

export async function createWorkout(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const name = formData.get("name") as string;

  await db.insert(workouts).values({
    userId: session.user.id, // CRITICAL: Set user ID
    name,
    startTime: new Date(),
  });

  revalidatePath("/workouts");
}

export async function deleteWorkout(workoutId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // CRITICAL: Verify ownership before deletion
  await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, session.user.id)
      )
    );

  revalidatePath("/workouts");
}
```

## Security Checklist

Before deploying any data fetching code, verify:

- [ ] Data is fetched in Server Components only
- [ ] All queries are in `/data` directory helper functions
- [ ] Drizzle ORM is used (no raw SQL)
- [ ] User authentication is checked before data access
- [ ] User ID filter is applied to ALL queries
- [ ] Data mutations verify ownership before making changes
- [ ] No database credentials are exposed to client

## Common Mistakes to Avoid

### ❌ Mistake 1: Client-Side Data Fetching
```typescript
"use client";
import { useEffect, useState } from "react";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch("/api/workouts")  // WRONG!
      .then(res => res.json())
      .then(setWorkouts);
  }, []);
}
```

### ❌ Mistake 2: Route Handlers
```typescript
// app/api/workouts/route.ts
export async function GET() {  // WRONG!
  const workouts = await db.select().from(workouts);
  return Response.json(workouts);
}
```

### ❌ Mistake 3: Missing User Filter
```typescript
export async function getWorkout(workoutId: string) {
  // SECURITY VULNERABILITY - No user check!
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));
}
```

### ❌ Mistake 4: Raw SQL
```typescript
export async function getWorkouts(userId: string) {
  // WRONG - Use Drizzle ORM instead
  return await db.execute(
    sql`SELECT * FROM workouts WHERE user_id = ${userId}`
  );
}
```

## Summary

1. **Server Components ONLY** for all data fetching
2. **`/data` directory** for all database query helpers
3. **Drizzle ORM** exclusively (no raw SQL)
4. **User ID filtering** on every single query
5. **Authentication checks** before any data access
6. **Ownership verification** before mutations

Following these standards is **non-negotiable** for the security and integrity of the application.
