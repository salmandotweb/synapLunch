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

  getFoodSummaryById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.id) return null;

      return ctx.prisma.foodSummary.findUnique({
        where: {
          id: input.id,
        },
        include: {
          membersBroughtFood: true,
          membersDidntBringFood: true,
        },
      });
    }),

  createFoodSummary: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        membersDidNotBringFood: z.array(z.string()),
        ...foodFormSchema.shape,
        fileKey: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const extraMembers =
        input.extraMembers?.map((member) => ({
          id: member.relatedTo,
          numberOfMembers: member.numberOfMembers,
        })) || [];

      const foodSummary = await ctx.prisma.foodSummary.create({
        data: {
          date: input.date,
          totalBreadsAmount: Number(input.breadsAmount),
          totalCurriesAmount: Number(input.curriesAmount),
          reciept: input.fileKey,
          extraMembers: {
            createMany: {
              data: extraMembers.map((extraMember) => ({
                noOfPeople: Number(extraMember.numberOfMembers),
                memberRelatedToId: extraMember.id,
              })),
            },
          },
          totalAmount: Number(input.totalAmount),
          company: {
            connect: {
              id: input.companyId,
            },
          },
          membersBroughtFood: {
            connect: input.membersBroughtFood?.map((memberId) => ({
              id: memberId,
            })),
          },
          membersDidntBringFood: {
            connect: input.membersDidNotBringFood.map((memberId) => ({
              id: memberId,
            })),
          },
        },
      });

      await ctx.prisma.company.update({
        where: {
          id: input.companyId,
        },
        data: {
          balance: {
            decrement: Number(input.breadsAmount),
          },
        },
      });

      const membersDidNotBringFoodCount = input.membersDidNotBringFood.length;
      const totalExtraMembers = extraMembers.reduce(
        (acc, curr) => acc + Number(curr.numberOfMembers),
        0,
      );
      const totalMembers = membersDidNotBringFoodCount + totalExtraMembers || 0;
      const totalAmountWithoutBreads =
        Number(input.totalAmount) - Number(input.breadsAmount);
      const amountToBeDeductedFromEachMember =
        totalAmountWithoutBreads / totalMembers;

      const updateMemberBalancePromises = input.membersDidNotBringFood.map(
        (memberId) => {
          const extraMember = extraMembers.find(
            (extraMember) => extraMember.id === memberId,
          );
          const withExtraMembers = extraMember
            ? Number(extraMember.numberOfMembers) + 1
            : 1;

          return ctx.prisma.member.update({
            where: {
              id: memberId,
            },
            data: {
              balance: {
                decrement: Math.round(
                  amountToBeDeductedFromEachMember * Number(withExtraMembers),
                ),
              },
            },
          });
        },
      );

      await Promise.all(updateMemberBalancePromises);

      const updateMembersWhoBroughtPromises =
        input.membersBroughtFood?.map((memberId) => {
          const extraMember = extraMembers.find(
            (extraMember) => extraMember.id === memberId,
          );

          if (extraMember) {
            return ctx.prisma.member.update({
              where: {
                id: memberId,
              },
              data: {
                balance: {
                  decrement: Math.round(
                    amountToBeDeductedFromEachMember *
                      Number(extraMember.numberOfMembers),
                  ),
                },
              },
            });
          }
        }) || [];

      await Promise.all(updateMembersWhoBroughtPromises);

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
          membersBroughtFood: true,
          extraMembers: true,
        },
      });

      const deleteExtraMembersPromises = getSummary?.extraMembers.map(
        (member) =>
          ctx.prisma.extraMembers.delete({
            where: {
              id: member.id,
            },
          }),
      );

      await Promise.all(deleteExtraMembersPromises || []);

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

      const totalAmountWithoutBreads =
        Number(getSummary?.totalAmount) - Number(getSummary?.totalBreadsAmount);

      const updateMembersBalancePromises =
        getSummary?.membersDidntBringFood.map((member) => {
          const extraMember = getSummary?.extraMembers.find(
            (extraMember) => extraMember.memberRelatedToId === member.id,
          );
          const withExtraMembers = extraMember
            ? Number(extraMember.noOfPeople) + 1
            : 1;
          const amountToIncrement = Math.round(
            totalAmountWithoutBreads / withExtraMembers,
          );

          return ctx.prisma.member.update({
            where: {
              id: member.id,
            },
            data: {
              balance: {
                increment: amountToIncrement,
              },
            },
          });
        });

      await Promise.all(updateMembersBalancePromises || []);

      const updateMembersWhoBroughtBalancePromises =
        getSummary?.membersBroughtFood.map((member) => {
          const extraMember = getSummary?.extraMembers.find(
            (extraMember) => extraMember.memberRelatedToId === member.id,
          );

          if (extraMember) {
            const amountToIncrement = Math.round(
              totalAmountWithoutBreads / extraMember.noOfPeople,
            );

            return ctx.prisma.member.update({
              where: {
                id: member.id,
              },
              data: {
                balance: {
                  increment: amountToIncrement,
                },
              },
            });
          }
        });

      await Promise.all(updateMembersWhoBroughtBalancePromises || []);

      return totalAmountWithoutBreads;
    }),
});
