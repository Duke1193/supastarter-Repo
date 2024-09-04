import { redirect } from "@i18n";
import { currentUser } from "@saas/auth/lib/current-user";
import { ChangeNameForm } from "@saas/settings/components/ChangeNameForm";
import { ChangePasswordForm } from "@saas/settings/components/ChangePassword";
import { DeleteAccountForm } from "@saas/settings/components/DeleteAccountForm";
import { UserAvatarForm } from "@saas/settings/components/UserAvatarForm";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
	const t = await getTranslations();

	return {
		title: t("settings.account.title"),
	};
}

export default async function AccountSettingsPage() {
	const { user } = await currentUser();

	if (!user) {
		return redirect("/auth/login");
	}

	return (
		<div className="grid gap-6">
			<UserAvatarForm />
			<ChangeNameForm initialValue={user.name ?? ""} />
			<ChangePasswordForm />
			<DeleteAccountForm />
		</div>
	);
}
