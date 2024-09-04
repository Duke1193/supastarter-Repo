import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { MailCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function TeamInvitationInfo({ className }: { className?: string }) {
	const t = useTranslations();
	return (
		<Alert variant="primary" className={className}>
			<MailCheckIcon className="size-6" />
			<AlertTitle>{t("auth.teamInvitation.title")}</AlertTitle>
			<AlertDescription>
				{t("auth.teamInvitation.description")}
			</AlertDescription>
		</Alert>
	);
}
