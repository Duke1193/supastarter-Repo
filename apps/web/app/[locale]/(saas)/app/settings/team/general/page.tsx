import { redirect } from "@i18n";
import { currentUser } from "@saas/auth/lib/current-user";
import { ChangeTeamNameForm } from "@saas/settings/components/ChangeTeamNameForm";
import { DeleteTeamForm } from "@saas/settings/components/DeleteTeamForm";
import { TeamAvatarForm } from "@saas/settings/components/TeamAvatarForm";
import { getTranslations } from "next-intl/server";
export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.team.title"),
	};
}

export default async function TeamSettingsPage() {
	const { team } = await currentUser();

	if (!team) {
		return redirect("/app");
	}

	return (
		<div className="grid grid-cols-1 gap-6">
			<TeamAvatarForm />
			<ChangeTeamNameForm initialValue={team.name} teamId={team.id} />
			<DeleteTeamForm teamId={team.id} />
		</div>
	);
}
