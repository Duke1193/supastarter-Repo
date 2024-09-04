import {
	createCheckout,
	getSubscription,
	lemonSqueezySetup,
	listProducts,
	cancelSubscription as lsCancelSubscription,
	updateSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";
import type { SubscriptionStatusType } from "database";
import type {
	CancelSubscription,
	CreateCheckoutLink,
	CreateCustomerPortalLink,
	GetAllPlans,
	PauseSubscription,
	ResumeSubscription,
	SubscriptionPlan,
} from "../../types";

function initLemonsqueezyApi() {
	lemonSqueezySetup({
		apiKey: process.env.LEMONSQUEEZY_API_KEY as string,
	});
}

export const getAllPlans: GetAllPlans = async () => {
	initLemonsqueezyApi();

	const response = await listProducts({
		include: ["store", "variants"],
	});

	return (
		response.data?.data
			?.map((product): SubscriptionPlan => {
				const store =
					response.data?.included?.find(
						(item) =>
							item.type === "stores" &&
							Number(product.attributes.store_id) === Number(item.id),
					) ?? null;
				const currency = (store?.attributes.currency as string) ?? "USD";

				return {
					id: product.id,
					name: product.attributes.name,
					description: product.attributes.description,
					storeId: String(store?.id),
					variants: (response.data?.included ?? [])
						.filter(
							(item) =>
								item.type === "variants" &&
								item.attributes.is_subscription &&
								Number(item.attributes.product_id) === Number(product.id),
						)
						.map((variant) => ({
							id: variant.id,
							interval: String(variant.attributes.interval),
							interval_count: Number(variant.attributes.interval_count),
							// we have to do some parsing here because the API (sometimes) returns the price as a string
							price: Number.parseFloat(String(variant.attributes.price)),
							currency,
						})),
				};
			})
			.filter((product) => product.variants.length > 0) ?? []
	);
};

export const createCheckoutLink: CreateCheckoutLink = async ({
	variantId,
	email,
	name,
	teamId,
	redirectUrl,
}) => {
	initLemonsqueezyApi();

	const response = await createCheckout(
		String(process.env.LEMONSQUEEZY_STORE_ID),
		variantId,
		{
			productOptions: {
				redirectUrl,
				enabledVariants: [Number.parseInt(variantId)],
			},
			checkoutData: {
				email,
				name,
				custom: {
					team_id: teamId,
				},
			},
		},
	);

	return response.data?.data.attributes.url ?? null;
};

export const createCustomerPortalLink: CreateCustomerPortalLink = async ({
	subscriptionId,
}) => {
	initLemonsqueezyApi();

	const response = await getSubscription(subscriptionId);

	return response.data?.data.attributes.urls.update_payment_method ?? null;
};

export const pauseSubscription: PauseSubscription = async ({ id }) => {
	initLemonsqueezyApi();

	await updateSubscription(id, {
		pause: {
			mode: "free",
		},
	});
};

export const cancelSubscription: CancelSubscription = async ({ id }) => {
	initLemonsqueezyApi();

	await lsCancelSubscription(id);
};

export const resumeSubscription: ResumeSubscription = async ({ id }) => {
	const response = await updateSubscription(id, {
		cancelled: false,
	});
	return {
		status: response.data?.data.attributes.status as SubscriptionStatusType,
	};
};
