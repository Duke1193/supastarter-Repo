"use client";

import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { useToast } from "@ui/hooks/use-toast";
import { PauseIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function PauseSubscriptionButton({ id }: { id: string }) {
	const t = useTranslations();
	const router = useRouter();
	const { toast } = useToast();
	const pauseSubscriptionMutation =
		apiClient.billing.pauseSubscription.useMutation({
			onSuccess: () => {
				toast({
					variant: "success",
					title: t(
						"settings.billing.pauseSubscription.notifications.success.title",
					),
				});
				router.refresh();
			},
			onError: () => {
				toast({
					variant: "error",
					title: t(
						"settings.billing.pauseSubscription.notifications.error.title",
					),
				});
			},
		});

	const pauseSubscription = async () => {
		try {
			await pauseSubscriptionMutation.mutateAsync({ id });
		} catch {
			// TODO: add error notification
		}
	};

	return (
		<Button
			variant="outline"
			onClick={() => pauseSubscription()}
			loading={pauseSubscriptionMutation.isPending}
		>
			<PauseIcon className="mr-2 size-4" />
			{t("settings.billing.pauseSubscription.label")}
		</Button>
	);
}
