ALTER TABLE "exercises" DROP CONSTRAINT "exercises_name_unique";--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "workouts" ADD COLUMN "user_id" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX "exercises_name_user_idx" ON "exercises" USING btree ("name","user_id");--> statement-breakpoint
CREATE INDEX "workouts_user_id_idx" ON "workouts" USING btree ("user_id");