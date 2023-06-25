import { memberFormSchema } from "~/components/Team/AddTeamMember";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const memberRouter = createTRPCRouter({
  getTeamMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.prisma.member.findMany({
      where: {
        companyId: ctx.session.user.id,
      },
      include: {
        user: true,
      },
    });

    return members;
  }),

  createMember: protectedProcedure
    .input(memberFormSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.member.create({
        data: {
          user: {
            create: {
              name: input.name,
              email: input.email,
              image: "https://via.placeholder.com/150",
            },
          },
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
    }),
});
