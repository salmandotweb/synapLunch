import { companyRouter } from "./routers/company";
import { foodSummaryRouter } from "./routers/foodSummary";
import { memberRouter } from "./routers/member";
import { s3Router } from "./routers/s3";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  company: companyRouter,
  member: memberRouter,
  foodSummary: foodSummaryRouter,
  s3: s3Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
