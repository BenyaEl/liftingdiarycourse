import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  numeric,
  boolean,
  index
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// Exercises Table - Master exercise library
export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  videoUrl: varchar("video_url", { length: 500 }),
  isCustom: boolean("is_custom").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workouts Table - Individual workout sessions
export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutDate: timestamp("workout_date").defaultNow().notNull(),
  title: varchar({ length: 255 }),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  workoutDateIdx: index("workouts_workout_date_idx").on(table.workoutDate),
}));

// Workout Exercises Table - Junction between workouts and exercises
export const workoutExercisesTable = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer("workout_id").notNull().references(() => workoutsTable.id, {
    onDelete: "cascade"
  }),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id, {
    onDelete: "restrict"
  }),
  order: integer().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  workoutIdIdx: index("workout_exercises_workout_id_idx").on(table.workoutId),
  exerciseIdIdx: index("workout_exercises_exercise_id_idx").on(table.exerciseId),
}));

// Sets Table - Individual sets with performance data
export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer("workout_exercise_id").notNull().references(
    () => workoutExercisesTable.id,
    { onDelete: "cascade" }
  ),
  setNumber: integer("set_number").notNull(),
  reps: integer().notNull(),
  weight: numeric({ precision: 10, scale: 2 }),
  weightUnit: varchar("weight_unit", { length: 10 }).default("lbs"),
  completed: boolean().default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  workoutExerciseIdIdx: index("sets_workout_exercise_id_idx").on(table.workoutExerciseId),
}));

// TypeScript Types - Select (reading from database)
export type Exercise = InferSelectModel<typeof exercisesTable>;
export type Workout = InferSelectModel<typeof workoutsTable>;
export type WorkoutExercise = InferSelectModel<typeof workoutExercisesTable>;
export type Set = InferSelectModel<typeof setsTable>;

// TypeScript Types - Insert (writing to database)
export type NewExercise = InferInsertModel<typeof exercisesTable>;
export type NewWorkout = InferInsertModel<typeof workoutsTable>;
export type NewWorkoutExercise = InferInsertModel<typeof workoutExercisesTable>;
export type NewSet = InferInsertModel<typeof setsTable>;
