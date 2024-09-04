"use client";

import { ActionBlock } from "@saas/shared/components/ActionBlock";
import { useToast } from "@ui/hooks/use-toast";
import { useTranslations } from "next-intl";
import { UserAvatarUpload } from "./UserAvatarUpload";

export function UserAvatarForm() {
	const { toast } = useToast();
	const t = useTranslations();

	return (
		<ActionBlock title={t("settings.account.avatar.title")}>
			<div className="flex items-center gap-4">
				<div>
					<p>{t("settings.account.avatar.description")}</p>
				</div>

				<UserAvatarUpload
					onSuccess={() => {
						toast({
							variant: "success",
							title: t("settings.notifications.avatarUpdated"),
						});
					}}
					onError={() => {
						toast({
							variant: "error",
							title: t("settings.notifications.avatarNotUpdated"),
						});
					}}
				/>
			</div>
		</ActionBlock>
	);
}
