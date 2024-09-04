import { TRPCError } from "@trpc/server";
import type { Subscription } from "database";
import { SubscriptionSchema, db } from "database";
import { logger } from "logs";
import { publicProcedure } from "../../../trpc/base";

export const syncSubscription = publicProcedure
	.input(SubscriptionSchema)
	.mutation(async ({ input: subscription, ctx: { isAdmin } }) => {
		// this procedure can only be called by the admin caller from a webhook
		if (!isAdmin) {
			throw new TRPCError({
				code: "FORBIDDEN",
			});
		}

		let existingSubscription: Subscription | null = null;

		if (subscription?.teamId) {
			existingSubscription = await db.subscription.findUnique({
				where: {
					teamId: subscription.teamId,
				},
			});
		}

		try {
			if (!existingSubscription) {
				await db.subscription.create({
					data: subscription,
				});
			} else {
				await db.subscription.update({
					where: {
						teamId: existingSubscription.teamId,
					},
					data: subscription,
				});
			}
		} catch (e) {
			logger.error(e);

			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
			});
		}
	});
