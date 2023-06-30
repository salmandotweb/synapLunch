import { z } from "zod";

import { foodFormSchema } from "~/pages/food-summary";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
      const totalExtraMembers = input.extraMembers?.map((member) => {
        return member.numberOfMembers;
      });

      const sumOfExtraMembers = totalExtraMembers?.reduce(
        (accumulator, currentValue) => accumulator + parseInt(currentValue),
        0,
      );

      const extraMembersRelatedTo = input.extraMembers?.map((member) => {
        return member.relatedTo;
      });

      const foodSummary = ctx.prisma.foodSummary.create({
        data: {
          date: input.date,
          totalBreadsAmount: Number(input.breadsAmount),
          totalCurriesAmount: Number(input.curriesAmount),
          extraMembers: sumOfExtraMembers,
          extraMembersRelatedTo: {
            connect: extraMembersRelatedTo?.map((memberId) => {
              return {
                id: memberId,
              };
            }),
          },
          totalAmount: Number(input.totalAmount),
          company: {
            connect: {
              id: input.companyId,
            },
          },
          membersBroughtFood: {
            connect: input.membersBroughtFood?.map((memberId) => {
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

      const members = await ctx.prisma.member.findMany({
        where: {
          id: {
            in: input.membersDidNotBringFood,
          },

          companyId: input.companyId,
        },
      });

      const roundedTotalAmount = Math.round(Number(input.totalAmount));

      const totalBreadAmount = Number(input.breadsAmount);

      const remainingAmount = roundedTotalAmount - totalBreadAmount;

      const amountToBeDeducted = remainingAmount / members.length;

      const roundedAmountToBeDeducted = Math.round(amountToBeDeducted);

      const updateCompanyBalance = ctx.prisma.company.update({
        where: {
          id: input.companyId,
        },
        data: {
          balance: {
            decrement: totalBreadAmount,
          },
        },
      });

      await updateCompanyBalance;

      const updateMemberBalancePromises = members.map((member) => {
        return ctx.prisma.member.update({
          where: {
            id: member.id,
          },

          data: {
            balance: member.balance - roundedAmountToBeDeducted,
          },
        });
      });

      await Promise.all(updateMemberBalancePromises);

      return foodSummary;
    }),

  deleteFoodSummary: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const getSummary = await ctx.prisma.foodSummary.findUnique({
        where: {
          id: input.id,
        },

        include: {
          membersDidntBringFood: true,
        },
      });

      const deleteSummary = ctx.prisma.foodSummary.delete({
        where: {
          id: input.id,
        },
      });

      await deleteSummary;

      const updateCompanyBalance = ctx.prisma.company.update({
        where: {
          id: getSummary?.companyId,
        },
        data: {
          balance: {
            increment: getSummary?.totalBreadsAmount,
          },
        },
      });

      await updateCompanyBalance;

      // update members balance who did not bring food
      const updateMemberBalancePromises = getSummary?.membersDidntBringFood.map(
        (member) => {
          return ctx.prisma.member.update({
            where: {
              id: member.id,
            },

            data: {
              balance: {
                increment:
                  getSummary?.totalCurriesAmount /
                  getSummary.membersDidntBringFood.length,
              },
            },
          });
        },
      );

      await Promise.all(updateMemberBalancePromises || []);

      return true;
    }),
});
