import { z } from "zod";

import { cashDepositFormSchema } from "~/components/Team/CashDepositForm";
import { memberFormSchema } from "~/components/Team/MemberForm";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const memberRouter = createTRPCRouter({
  getTeamMembers: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      const members = await ctx.prisma.member.findMany({
        where: {
          companyId: input.companyId,
        },
      });

      return members.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
    }),

  createMember: protectedProcedure
    .input(z.object({ companyId: z.string(), ...memberFormSchema.shape }))
    .mutation(async ({ ctx, input }) => {
      const isExistingMember = await ctx.prisma.member.findFirst({
        where: {
          companyId: input.companyId,
          email: input.email,
        },
      });

      if (isExistingMember) {
        throw new Error("Member already exists");
      } else {
        return ctx.prisma.member.create({
          data: {
            name: input.name,
            email: input.email,
            designation: input.designation,
            role: input.role,
            company: {
              connect: {
                id: input.companyId,
              },
            },
          },
        });
      }
    }),

  updateMember: protectedProcedure
    .input(z.object({ id: z.string(), ...memberFormSchema.shape }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.member.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          designation: input.designation,
          role: input.role,
        },
      });
    }),

  deleteMember: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.member.delete({
        where: {
          id: input.id,
        },
      });
    }),

  addCashDeposit: protectedProcedure
    .input(z.object({ id: z.string(), ...cashDepositFormSchema.shape }))
    .mutation(async ({ ctx, input }) => {
      const { id, amount, date } = input;

      const createdDeposit = await ctx.prisma.deposit.create({
        data: {
          date,
          amount,
          member: {
            connect: {
              id,
            },
          },
        },
      });

      const updatedMember = await ctx.prisma.member.update({
        where: {
          id,
        },
        data: {
          balance: {
            increment: amount,
          },
          lastCashDeposit: date,
        },
      });

      return { createdDeposit, updatedMember };
    }),
});
