import { z } from "zod";

import { profileFormSchema } from "~/pages/company/create";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const companyRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.company.findMany({
      where: { userId: ctx.session.user.id },
      include: { owner: true },
    });
  }),

  create: protectedProcedure
    .input(profileFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.company.create({
        data: {
          name: input.name,
          email: ctx.session.user.email ?? "",
          owner: { connect: { id: ctx.session.user.id } },
          userId: ctx.session.user.id,
        },
      });
    }),
});
