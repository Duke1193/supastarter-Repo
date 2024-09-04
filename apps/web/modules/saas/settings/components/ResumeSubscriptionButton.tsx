"use client";

import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { useToast } from "@ui/hooks/use-toast";
import { UndoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ResumeSubscriptionButton({
	id,
	label,
}: {
	id: string;
	label: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const { toast } = useToast();
	const resumeSubscriptionMutation =
		apiClient.billing.resumeSubscription.useMutation({
			onSuccess: () => {
				toast({
					variant: "success",
					title: t(
						"settings.billing.resumeSubscription.notifications.success.title",
					),
				});
				router.refresh();
			},
			onError: () => {
				toast({
					variant: "error",
					title: t(
						"settings.billing.resumeSubscription.notifications.error.title",
					),
				});
			},
		});

	const resumeSubscription = async () => {
		try {
			await resumeSubscriptionMutation.mutateAsync({ id });
		} catch {
			// TODO: add error notification
		}
	};

	return (
		<Button
			variant="outline"
			onClick={() => resumeSubscription()}
			loading={resumeSubscriptionMutation.isPending}
		>
			<UndoIcon className="mr-2 size-4" />
			{label}
		</Button>
	);
}
