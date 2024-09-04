import { createAdminApiCaller } from "api/trpc/caller";
import type { SubscriptionStatusType } from "database";

export async function POST(req: Request) {
	try {
		const payload = (await req.json()) as {
			event_type: string;
			content: {
				subscription: {
					id: string;
					status: string;
					trial_end: number;
					current_term_end: number;
					next_billing_at: number;
					cf_team_id: string;
					subscription_items: {
						item_price_id: string;
					}[];
				};
				customer: {
					id: string;
				};
			};
		} | null;

		const type = payload?.event_type ?? null;

		if (
			!type ||
			![
				"subscription_created",
				"subscription_cancelled",
				"subscription_changed",
			].includes(type)
		) {
			return new Response("Invalid event type.", {
				status: 400,
			});
		}

		const statusMap: Record<string, SubscriptionStatusType> = {
			active: "ACTIVE",
			past_due: "PAST_DUE",
			unpaid: "UNPAID",
			cancelled: "CANCELED",
			in_trial: "TRIALING",
			paused: "PAUSED",
		};

		const apiCaller = await createAdminApiCaller();
		const plans = await apiCaller.billing.plans();

		const data = payload?.content;

		if (!data?.subscription.cf_team_id) {
			throw new Error("Invalid payload.");
		}
		const selectedVariantId =
			data.subscription.subscription_items[0].item_price_id;

		let selectedPlanId: string;
		for (const plan of plans) {
			for (const variant of plan.variants) {
				if (variant.id === selectedVariantId) {
					selectedPlanId = plan.id;
				}
			}
		}

		await apiCaller.billing.syncSubscription({
			id: String(data.subscription.id),
			teamId: data.subscription?.cf_team_id,
			customerId: String(data.customer.id),
			// biome-ignore lint/style/noNonNullAssertion: This is a valid assertion
			planId: String(selectedPlanId!),
			variantId: String(selectedVariantId),
			status: statusMap[data.subscription.status],
			nextPaymentDate: new Date(
				(data.subscription.trial_end ??
					data.subscription.current_term_end ??
					0) * 1000,
			),
		});
	} catch (error: unknown) {
		return new Response(
			`Webhook error: ${error instanceof Error ? error.message : ""}`,
			{
				status: 400,
			},
		);
	}

	return new Response(null, {
		status: 204,
	});
}
