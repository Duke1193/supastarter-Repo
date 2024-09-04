import { ChargeBee } from "chargebee-typescript";
import type { ItemPrice } from "chargebee-typescript/lib/resources";
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

let chargebeeClient: ChargeBee | null = null;

export function getChargebeeClient() {
	if (chargebeeClient) {
		return chargebeeClient;
	}

	const chargebeeSite = process.env.CHARGEBEE_SITE as string;
	const chargebeeApiKey = process.env.CHARGEBEE_API_KEY as string;

	if (!chargebeeSite) {
		throw new Error("Missing env variable CHARGEBEE_SITE");
	}

	if (!chargebeeApiKey) {
		throw new Error("Missing env variable CHARGEBEE_API_KEY");
	}

	chargebeeClient = new ChargeBee();

	chargebeeClient.configure({
		site: chargebeeSite,
		api_key: chargebeeApiKey,
	});

	return chargebeeClient;
}

export const getAllPlans: GetAllPlans = async () => {
	const chargebeeClient = getChargebeeClient();

	const response = await chargebeeClient?.item_price
		.list({
			item_family_id: {
				is: "supastarter",
			},
		})
		.request();

	if (!response) {
		throw new Error("No response to list plans from Chargebee");
	}

	const plans: SubscriptionPlan[] = [];

	response.list.forEach((price: { item_price: ItemPrice }) => {
		const itemPrice = price.item_price;
		if (!plans.find((plan) => plan.id === itemPrice.item_id)) {
			plans.push({
				id: itemPrice.item_id ?? "",
				name: itemPrice.external_name ?? "",
				description: itemPrice.description,
				storeId: "",
				variants: [
					{
						id: itemPrice.id,
						interval: itemPrice.period_unit ?? "year",
						interval_count: itemPrice.period ?? 1,
						price: itemPrice.price ?? 0,
						currency: itemPrice.currency_code,
					},
				],
			});

			return;
		}

		const plan = plans.find((plan) => plan.id === itemPrice.item_id);

		plan?.variants.push({
			id: itemPrice.id,
			interval: itemPrice.period_unit ?? "year",
			interval_count: itemPrice.period ?? 1,
			price: itemPrice.price ?? 0,
			currency: itemPrice.currency_code,
		});
	});

	return plans.filter((product) => product.variants.length > 0);
};

export const createCheckoutLink: CreateCheckoutLink = async ({
	variantId,
	teamId,
	redirectUrl,
	email,
	name,
}) => {
	// splitting name into first & last names, possible to go wrong in some cases
	//  but Chargebee Checkout lets users edit the info before completing the checkout
	const [firstName, lastName] = name ? name.split(" ") : ["", ""];
	const chargebeeClient = getChargebeeClient();

	const response = await chargebeeClient.hosted_page
		.checkout_new_for_items({
			subscription_items: [
				{
					item_price_id: variantId,
				},
			],
			subscription: {
				// @ts-ignore
				cf_team_id: teamId,
			},
			customer: {
				email,
				first_name: firstName,
				last_name: lastName,
			},
			billing_address: {
				email,
				first_name: firstName,
				last_name: lastName,
			},
			redirect_url: redirectUrl,
		})
		.request();

	return response.hosted_page.url;
};

export const createCustomerPortalLink: CreateCustomerPortalLink = async ({
	customerId,
	redirectUrl,
}) => {
	const chargebeeClient = getChargebeeClient();

	const response = await chargebeeClient.portal_session
		.create({
			customer: {
				id: customerId,
			},
			redirect_url: redirectUrl,
		})
		.request();

	return response.portal_session.access_url;
};

export const pauseSubscription: PauseSubscription = async ({ id }) => {
	const chargebeeClient = getChargebeeClient();

	await chargebeeClient.subscription
		.update_for_items(id, {
			auto_collection: "off",
		})
		.request();
};

export const cancelSubscription: CancelSubscription = async ({ id }) => {
	const chargebeeClient = getChargebeeClient();

	await chargebeeClient.subscription.cancel_for_items(id).request();
};

export const resumeSubscription: ResumeSubscription = async ({ id }) => {
	const chargebeeClient = getChargebeeClient();

	const response = await chargebeeClient.subscription.reactivate(id).request();

	return {
		status: response.subscription.status as SubscriptionStatusType,
	};
};
