import { sendEmail } from "mail";
import { z } from "zod";
import { publicProcedure } from "../../../trpc/base";

export const signup = publicProcedure
	.input(
		z.object({
			email: z.string(),
		}),
	)
	.mutation(async ({ input: { email }, ctx: { locale } }) => {
		await sendEmail({
			to: email,
			locale,
			templateId: "newsletterSignup",
			context: {},
		});
	});
