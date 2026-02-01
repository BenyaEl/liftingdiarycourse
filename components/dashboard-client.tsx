"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Workout } from "@/src/db/schema";

interface WorkoutWithDetails extends Workout {
  exercises?: {
    workoutExerciseId: number;
    order: number;
    exerciseId: number;
    exerciseName: string;
    videoUrl: string | null;
    sets: {
      id: number;
      setNumber: number;
      reps: number;
      weight: string | null;
      weightUnit: string | null;
      completed: boolean;
    }[];
  }[];
}

interface DashboardClientProps {
  initialWorkouts: WorkoutWithDetails[];
  initialDate: Date;
}

export function DashboardClient({
  initialWorkouts,
  initialDate,
}: DashboardClientProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [workouts, setWorkouts] = useState<WorkoutWithDetails[]>(initialWorkouts);

  // Sync workouts when initialWorkouts prop changes (on navigation)
  useEffect(() => {
    setWorkouts(initialWorkouts);
    setSelectedDate(initialDate);
  }, [initialWorkouts, initialDate]);

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;

    setSelectedDate(date);

    // Navigate with new date - triggers server-side data fetch
    const formattedDate = format(date, "yyyy-MM-dd");
    router.push(`/dashboard?date=${formattedDate}`);
  };

  const calculateDuration = (startedAt: Date | null, completedAt: Date | null) => {
    if (!startedAt || !completedAt) return null;
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return minutes;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your workout progress
          </p>
        </div>

        {/* Calendar - Always Visible */}
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              className="mx-auto"
            />
          </CardContent>
        </Card>

        {/* Workouts Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Workouts for {format(selectedDate, "dd/MM/yyyy")}
          </h2>

          {workouts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-lg">
                    No workouts logged for this date
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    This is a rest day or you haven&apos;t logged any workouts yet
                  </p>
                  <Button className="mt-4">Log New Workout</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workouts.map((workout) => {
                const duration = calculateDuration(
                  workout.startedAt,
                  workout.completedAt
                );
                const startTime = workout.startedAt
                  ? format(new Date(workout.startedAt), "HH:mm")
                  : "N/A";

                return (
                  <Card key={workout.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {workout.title || "Untitled Workout"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {startTime}
                            {duration && ` • ${duration} minutes`}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    {workout.exercises && workout.exercises.length > 0 && (
                      <CardContent>
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Exercises</h4>
                          <div className="space-y-2">
                            {workout.exercises.map((exercise) => {
                              const totalSets = exercise.sets.length;
                              const avgReps =
                                totalSets > 0
                                  ? Math.round(
                                      exercise.sets.reduce(
                                        (sum, set) => sum + set.reps,
                                        0
                                      ) / totalSets
                                    )
                                  : 0;
                              const avgWeight =
                                totalSets > 0
                                  ? exercise.sets
                                      .filter((set) => set.weight)
                                      .reduce(
                                        (sum, set) =>
                                          sum + parseFloat(set.weight || "0"),
                                        0
                                      ) / totalSets
                                  : 0;

                              return (
                                <div
                                  key={exercise.workoutExerciseId}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <span className="font-medium">
                                    {exercise.exerciseName}
                                  </span>
                                  <div className="flex gap-4 text-sm text-muted-foreground">
                                    <span>
                                      {totalSets} × {avgReps}
                                    </span>
                                    {avgWeight > 0 && (
                                      <span className="font-semibold text-foreground">
                                        {avgWeight.toFixed(1)}{" "}
                                        {exercise.sets[0]?.weightUnit || "kg"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
