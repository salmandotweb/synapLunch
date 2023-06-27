import { z } from "zod";

import { companyFormSchema } from "~/components/SetupCompany";
import { topupFormSchema } from "~/components/Team/TopupForm";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  getCompany: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.prisma.company.findMany({
      take: 1,
      where: {
        ownerId: ctx.session.user.id,
      },
      include: {
        owner: true,
      },
    });

    const firstCompany = companies[0];

    return firstCompany;
  }),

  getCompanyId: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.prisma.company.findMany({
      where: {
        ownerId: ctx.session.user.id,
        email: ctx.session.user.email ?? "",
      },
    });

    const id = companies[0]?.id;

    return id;
  }),

  createCompany: protectedProcedure
    .input(companyFormSchema)
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.create({
        data: {
          name: input.name,
          email: input.email,
          website: input.websiteUrl,
          owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });

      return company;
    }),

  updateCompany: protectedProcedure
    .input(companyFormSchema)
    .mutation(async ({ ctx, input }) => {
      const updateCompany = await ctx.prisma.company.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          website: input.websiteUrl,
          breadPrice: input.breadPrice,
        },
      });

      return updateCompany;
    }),

  addTopup: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        ...topupFormSchema.shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const topup = await ctx.prisma.topup.create({
        data: {
          date: input.date,
          amount: input.amount,
          company: {
            connect: {
              id: input.companyId,
            },
          },
          topupBy: {
            connect: {
              id: input.topupBy,
            },
          },
        },
      });

      // Update the balance of the company
      await ctx.prisma.company.update({
        where: {
          id: input.companyId,
        },

        data: {
          balance: {
            increment: input.amount,
          },
          lastTopup: input.date,
        },
      });

      return topup;
    }),

  // company stats

  // count of total members

  getTotalMembers: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const totalMembers = await ctx.prisma.member.count({
        where: {
          companyId: input.companyId,
        },
      });

      return totalMembers;
    }),

  getIncreaseOrDecrease: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get the current date
      const currentDate = new Date();

      // Calculate the start date of last month
      const lastMonthStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1,
      );

      // Calculate the start date of the current month
      const currentMonthStartDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );

      // Get the total members created in the current month
      const currentMonthMembers = await ctx.prisma.member.count({
        where: {
          companyId: input.companyId,
          createdAt: {
            gte: currentMonthStartDate,
          },
        },
      });

      // Get the total members created in the last month
      const lastMonthMembers = await ctx.prisma.member.count({
        where: {
          companyId: input.companyId,
          createdAt: {
            gte: lastMonthStartDate,
            lt: currentMonthStartDate,
          },
        },
      });

      // Calculate the increase or decrease in members from last month
      const diffFromLastMonth = currentMonthMembers - lastMonthMembers;
      const sign = diffFromLastMonth >= 0 ? "+" : "-";

      // Calculate the absolute difference
      const absoluteDiff = Math.abs(diffFromLastMonth);

      // Prepare the result with sign
      const result = `${sign}${absoluteDiff}`;

      return result;
    }),

  getBalance: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const balance = await ctx.prisma.company.findFirst({
        where: {
          id: input.companyId,
        },
        select: {
          balance: true,
          lastTopup: true,
        },
      });

      return balance;
    }),
});
