"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  createWorkout,
  type CreateExerciseInput,
  type CreateSetInput,
} from "@/data/workouts";
import type { Exercise } from "@/src/db/schema";

interface CreateWorkoutFormProps {
  exercises: Exercise[];
}

interface WorkoutExercise {
  id: string;
  exerciseId: number;
  exerciseName: string;
  sets: WorkoutSet[];
}

interface WorkoutSet {
  id: string;
  reps: number;
  weight: string;
  weightUnit: string;
}

export function CreateWorkoutForm({ exercises }: CreateWorkoutFormProps) {
  const [title, setTitle] = useState("");
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExercise = () => {
    if (!selectedExerciseId) return;

    const exercise = exercises.find((e) => e.id === parseInt(selectedExerciseId));
    if (!exercise) return;

    const newExercise: WorkoutExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [
        {
          id: crypto.randomUUID(),
          reps: 10,
          weight: "",
          weightUnit: "lbs",
        },
      ],
    };

    setWorkoutExercises([...workoutExercises, newExercise]);
    setSelectedExerciseId("");
  };

  const handleRemoveExercise = (exerciseUniqueId: string) => {
    setWorkoutExercises(workoutExercises.filter((e) => e.id !== exerciseUniqueId));
  };

  const handleAddSet = (exerciseUniqueId: string) => {
    setWorkoutExercises(
      workoutExercises.map((exercise) => {
        if (exercise.id === exerciseUniqueId) {
          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: crypto.randomUUID(),
                reps: 10,
                weight: "",
                weightUnit: "lbs",
              },
            ],
          };
        }
        return exercise;
      })
    );
  };

  const handleRemoveSet = (exerciseUniqueId: string, setId: string) => {
    setWorkoutExercises(
      workoutExercises.map((exercise) => {
        if (exercise.id === exerciseUniqueId) {
          return {
            ...exercise,
            sets: exercise.sets.filter((s) => s.id !== setId),
          };
        }
        return exercise;
      })
    );
  };

  const handleSetChange = (
    exerciseUniqueId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string | number
  ) => {
    setWorkoutExercises(
      workoutExercises.map((exercise) => {
        if (exercise.id === exerciseUniqueId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) => {
              if (set.id === setId) {
                return { ...set, [field]: value };
              }
              return set;
            }),
          };
        }
        return exercise;
      })
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || workoutExercises.length === 0) return;

    setIsSubmitting(true);

    const exercisesInput: CreateExerciseInput[] = workoutExercises.map((exercise) => ({
      exerciseId: exercise.exerciseId,
      sets: exercise.sets.map((set): CreateSetInput => ({
        reps: set.reps,
        weight: set.weight || null,
        weightUnit: set.weightUnit,
      })),
    }));

    await createWorkout({
      title: title.trim(),
      workoutDate,
      exercises: exercisesInput,
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Workout</h1>
          <p className="text-muted-foreground mt-1">
            Log a new workout session
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Workout Title</Label>
              <Input
                id="title"
                placeholder="e.g., Morning Push Day"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {format(workoutDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={workoutDate}
                    onSelect={(date) => date && setWorkoutDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((exercise) => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>
                      {exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddExercise} disabled={!selectedExerciseId}>
                Add
              </Button>
            </div>

            {workoutExercises.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No exercises added yet. Select an exercise above to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {workoutExercises.map((exercise, exerciseIndex) => (
                  <Card key={exercise.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {exerciseIndex + 1}. {exercise.exerciseName}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExercise(exercise.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                        <div className="col-span-2">Set</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-3">Weight</div>
                        <div className="col-span-3">Unit</div>
                        <div className="col-span-1"></div>
                      </div>

                      {exercise.sets.map((set, setIndex) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-2 text-sm font-medium">
                            {setIndex + 1}
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              min="1"
                              value={set.reps}
                              onChange={(e) =>
                                handleSetChange(
                                  exercise.id,
                                  set.id,
                                  "reps",
                                  parseInt(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              step="0.5"
                              min="0"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) =>
                                handleSetChange(exercise.id, set.id, "weight", e.target.value)
                              }
                            />
                          </div>
                          <div className="col-span-3">
                            <Select
                              value={set.weightUnit}
                              onValueChange={(value) =>
                                handleSetChange(exercise.id, set.id, "weightUnit", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lbs">lbs</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1">
                            {exercise.sets.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleRemoveSet(exercise.id, set.id)}
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSet(exercise.id)}
                        className="w-full"
                      >
                        Add Set
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!title.trim() || workoutExercises.length === 0 || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Workout"}
        </Button>
      </div>
    </div>
  );
}
