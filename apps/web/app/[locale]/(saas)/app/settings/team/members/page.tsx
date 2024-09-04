import { redirect } from "@i18n";
import { currentUser } from "@saas/auth/lib/current-user";
import { InviteMemberForm } from "@saas/settings/components/InviteMemberForm";
import { TeamMembersBlock } from "@saas/settings/components/TeamMembersBlock";
import { createApiCaller } from "api/trpc/caller";
import { getTranslations } from "next-intl/server";
export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.team.title"),
	};
}

export default async function TeamSettingsPage() {
	const apiCaller = await createApiCaller();
	const { user, team } = await currentUser();

	if (!user || !team) {
		return redirect("/auth/login");
	}

	const memberships = await apiCaller.team.memberships({
		teamId: team.id,
	});

	const invitations = await apiCaller.team.invitations({
		teamId: team.id,
	});

	return (
		<div className="grid grid-cols-1 gap-6">
			<InviteMemberForm teamId={team.id} />
			<TeamMembersBlock memberships={memberships} invitations={invitations} />
		</div>
	);
}
