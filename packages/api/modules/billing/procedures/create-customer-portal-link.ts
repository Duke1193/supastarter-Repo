import { TRPCError } from "@trpc/server";
import { db } from "database";
import { logger } from "logs";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/base";
import { createCustomerPortalLink as createCustomerPortalLinkResolver } from "../provider";

export const createCustomerPortalLink = protectedProcedure
	.input(
		z.object({
			subscriptionId: z.string(),
			redirectUrl: z.string().optional(),
		}),
	)
	.output(z.string())
	.mutation(
		async ({ input: { subscriptionId, redirectUrl }, ctx: { abilities } }) => {
			const subscription = await db.subscription.findUnique({
				where: {
					id: subscriptionId,
				},
			});

			if (!subscription) {
				throw new TRPCError({
					code: "BAD_REQUEST",
				});
			}

			if (!abilities.isTeamOwner(subscription.teamId)) {
				throw new TRPCError({
					code: "FORBIDDEN",
				});
			}

			try {
				const customerPortalLink = await createCustomerPortalLinkResolver({
					subscriptionId,
					customerId: subscription.customerId,
					redirectUrl,
				});

				if (!customerPortalLink) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
					});
				}

				return customerPortalLink;
			} catch (e) {
				logger.error(e);

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
				});
			}
		},
	);
