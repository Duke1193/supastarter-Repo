import { redirect } from "@i18n";
import { currentUser } from "@saas/auth/lib/current-user";
import { SettingsMenu } from "@saas/settings/components/SettingsMenu";
import { TeamAvatar } from "@shared/components/TeamAvatar";
import { UserAvatar } from "@shared/components/UserAvatar";
import { getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";
export default async function SettingsLayout({ children }: PropsWithChildren) {
	const t = await getTranslations();
	const { user, team } = await currentUser();

	if (!user) {
		return redirect("/auth/login");
	}

	if (!team) {
		return null;
	}

	const menuItems = [
		{
			title: t("settings.menu.team.title"),
			avatar: <TeamAvatar name={team.name} avatarUrl={team.avatarUrl} />,
			items: [
				{
					title: t("settings.menu.team.general"),
					href: "/app/settings/team/general",
				},
				{
					title: t("settings.menu.team.members"),
					href: "/app/settings/team/members",
				},
				{
					title: t("settings.menu.team.billing"),
					href: "/app/settings/team/billing",
				},
			],
		},
		{
			title: t("settings.menu.account.title"),
			avatar: <UserAvatar name={user.name ?? ""} avatarUrl={user.avatarUrl} />,
			items: [
				{
					title: t("settings.menu.account.general"),
					href: "/app/settings/account/general",
				},
			],
		},
	];

	return (
		<div className="container max-w-6xl py-8">
			<div className="flex flex-col items-start gap-8 md:flex-row">
				<div className="w-full md:max-w-[200px]">
					<SettingsMenu menuItems={menuItems} />
				</div>

				<div className="flex-1">{children}</div>
			</div>
		</div>
	);
}
