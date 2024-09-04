import { UserSchema, db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/base";
import { getUserAvatarUrl } from "../lib/avatar-url";

export const update = protectedProcedure
	.input(
		z.object({
			name: z.string().min(1).optional(),
			avatarUrl: z.string().min(1).optional(),
			onboardingComplete: z.boolean().optional(),
		}),
	)
	.output(
		UserSchema.pick({
			id: true,
			email: true,
			role: true,
			avatarUrl: true,
			name: true,
			onboardingComplete: true,
		}),
	)
	.mutation(async ({ ctx: { user }, input }) => {
		const updatedUser = await db.user.update({
			where: {
				id: user.id,
			},
			data: input,
			select: {
				id: true,
				email: true,
				role: true,
				avatarUrl: true,
				name: true,
				onboardingComplete: true,
			},
		});

		return {
			...updatedUser,
			avatarUrl: await getUserAvatarUrl(updatedUser.avatarUrl),
		};
	});
