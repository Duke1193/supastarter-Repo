import { hashPassword } from "auth/lib/hashing";
import { passwordSchema } from "auth/lib/passwords";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/base";

export const changePassword = protectedProcedure
	.input(
		z.object({
			password: passwordSchema,
		}),
	)
	.mutation(async ({ ctx: { user }, input: { password } }) => {
		await db.user.update({
			where: {
				id: user.id,
			},
			data: {
				hashedPassword: await hashPassword(password),
			},
		});
	});
