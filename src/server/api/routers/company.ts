import { companyFormSchema } from "~/components/SetupCompany";
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
      },
    });

    const id = companies[0]?.id;

    return id;
  }),

  createCompany: protectedProcedure
    .input(companyFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.company.create({
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
    }),

  updateCompany: protectedProcedure
    .input(companyFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.company.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          website: input.websiteUrl,
        },
      });
    }),
});
