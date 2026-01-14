"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

// Mock workout data type
interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  name: string;
  startTime: string;
  duration: number;
  exercises: WorkoutExercise[];
}

// Mock data generator based on selected date
function getMockWorkouts(date: Date): Workout[] {
  // For demo purposes, return different mock data based on day of month
  const dayOfMonth = date.getDate();

  if (dayOfMonth % 3 === 0) {
    return [
      {
        id: "1",
        name: "Upper Body Strength",
        startTime: "09:00",
        duration: 65,
        exercises: [
          { id: "e1", exerciseName: "Bench Press", sets: 4, reps: 8, weight: 80 },
          { id: "e2", exerciseName: "Overhead Press", sets: 3, reps: 10, weight: 50 },
          { id: "e3", exerciseName: "Pull-ups", sets: 3, reps: 12, weight: 0 },
        ],
      },
    ];
  } else if (dayOfMonth % 3 === 1) {
    return [
      {
        id: "2",
        name: "Lower Body Power",
        startTime: "18:30",
        duration: 75,
        exercises: [
          { id: "e4", exerciseName: "Squats", sets: 5, reps: 5, weight: 120 },
          { id: "e5", exerciseName: "Romanian Deadlifts", sets: 4, reps: 8, weight: 100 },
          { id: "e6", exerciseName: "Leg Press", sets: 3, reps: 12, weight: 180 },
        ],
      },
    ];
  }

  // For other days, return empty array (rest day)
  return [];
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues by only rendering interactive elements after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get mock workouts for the selected date
  const workouts = getMockWorkouts(selectedDate);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your workout progress
            </p>
          </div>

          {isMounted ? (
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-[240px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="outline"
              className="w-full sm:w-[240px] justify-start text-left font-normal"
              disabled
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy")}
            </Button>
          )}
        </div>

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
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{workout.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {workout.startTime} • {workout.duration} minutes
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Exercises</h4>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <span className="font-medium">
                              {exercise.exerciseName}
                            </span>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>
                                {exercise.sets} × {exercise.reps}
                              </span>
                              {exercise.weight > 0 && (
                                <span className="font-semibold text-foreground">
                                  {exercise.weight} kg
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
