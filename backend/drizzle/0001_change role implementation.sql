ALTER TYPE "public"."employee_role" ADD VALUE 'security' BEFORE 'employee';--> statement-breakpoint
ALTER TABLE "employee_categories" ADD COLUMN "employee_role" "employee_role" DEFAULT 'employee' NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "role";