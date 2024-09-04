import { redirect } from "@i18n";
import { currentUser } from "@saas/auth/lib/current-user";
import { SubscriptionOverview } from "@saas/settings/components/SubscriptionOverview";
import { UpgradePlan } from "@saas/settings/components/UpgradePlan";
import { createApiCaller } from "api/trpc/caller";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.billing.title"),
	};
}

export default async function BillingSettingsPage() {
	const apiCaller = await createApiCaller();
	const plans = await apiCaller.billing.plans();
	const { user, team } = await currentUser();

	if (!user) {
		return redirect("/auth/login");
	}

	if (!team) {
		return redirect("/app/dashboard");
	}

	const teamSubscription = await apiCaller.team.subscription({
		teamId: team.id,
	});

	return (
		<div>
			<SubscriptionOverview
				plans={plans}
				currentSubscription={teamSubscription}
				className="mb-4"
			/>
			<UpgradePlan
				plans={plans}
				activePlanId={teamSubscription?.planId}
				teamId={team.id}
			/>
		</div>
	);
}
