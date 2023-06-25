import { companyRouter } from "./routers/company";
import { foodSummaryRouter } from "./routers/foodSummary";
import { memberRouter } from "./routers/member";
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
});

// export type definition of API
export type AppRouter = typeof appRouter;
