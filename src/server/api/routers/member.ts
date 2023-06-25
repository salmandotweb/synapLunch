import { z } from "zod";

import { memberFormSchema } from "~/pages/team";
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
});
