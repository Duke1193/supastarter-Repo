import { TRPCError } from "@trpc/server";
import { generateOneTimePassword, generateVerificationToken } from "auth";
import { db } from "database";
import { logger } from "logs";
import { sendEmail } from "mail";
import { getBaseUrl } from "utils";
import { z } from "zod";
import { adminProcedure } from "../../../trpc/base";

export const resendVerificationMail = adminProcedure
	.input(
		z.object({
			userId: z.string(),
		}),
	)
	.mutation(async ({ input: { userId }, ctx: { locale } }) => {
		const user = await db.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found.",
			});
		}

		if (user.emailVerified) {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "User's email is already verified.",
			});
		}

		const token = await generateVerificationToken({
			userId: user.id,
		});
		const otp = await generateOneTimePassword({
			userId: user.id,
			type: "SIGNUP",
			identifier: user.email,
		});

		const url = new URL(getBaseUrl());
		url.searchParams.set("token", token);

		try {
			await sendEmail({
				templateId: "newUser",
				to: user.email,
				locale,
				context: {
					url: url.toString(),
					otp,
					name: user.name ?? user.email,
				},
			});
		} catch (e) {
			logger.error(e);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Could not send email",
			});
		}
	});
