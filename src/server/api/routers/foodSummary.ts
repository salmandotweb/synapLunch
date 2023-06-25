import { z } from "zod";

import { foodFormSchema } from "~/pages/food-summary";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const foodSummaryRouter = createTRPCRouter({
  getAllFoodSummary: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.foodSummary.findMany({
        where: {
          companyId: input.companyId,
        },
        orderBy: {
          date: "desc",
        },
      });
    }),

  createFoodSummary: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        membersDidNotBringFood: z.array(z.string()),
        ...foodFormSchema.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.foodSummary.create({
        data: {
          date: input.date,
          numberOfPeople: Number(input.noOfMembers),
          totalBreads: Number(input.breads),
          totalCurries: Number(input.curries),
          totalAmount: Number(input.totalAmount),
          company: {
            connect: {
              id: input.companyId,
            },
          },
          membersBroughtFood: {
            connect: input.membersBroughtFood.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
          membersDidntBringFood: {
            connect: input.membersDidNotBringFood.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
        },
      });
    }),
});
