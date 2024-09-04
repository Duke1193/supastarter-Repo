import { TRPCError } from "@trpc/server";
import { lucia } from "auth";
import { db } from "database";
import { logger } from "logs";
import { z } from "zod";
import { adminProcedure } from "../../../trpc/base";

export const impersonate = adminProcedure
	.input(
		z.object({
			userId: z.string(),
		}),
	)
	.output(z.void())
	.mutation(
		async ({ input: { userId }, ctx: { user, session, responseHeaders } }) => {
			// check if user with id exists
			const userExists = await db.user.findUnique({
				where: {
					id: userId,
				},
			});

			if (!userExists) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			try {
				const newSession = await lucia.createSession(userId, {
					impersonatorId: user.id,
				});

				await lucia.invalidateSession(session.id);

				const sessionCookie = lucia.createSessionCookie(newSession.id);
				responseHeaders?.append("Set-Cookie", sessionCookie.serialize());
			} catch (e) {
				logger.error(e);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
				});
			}
		},
	);
