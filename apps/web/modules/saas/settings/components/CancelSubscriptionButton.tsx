"use client";

import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { useToast } from "@ui/hooks/use-toast";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function CancelSubscriptionButton({
	id,
	label,
}: {
	id: string;
	label: string;
}) {
	const t = useTranslations();
	const router = useRouter();
	const { toast } = useToast();
	const cancelSubscriptionMutation =
		apiClient.billing.cancelSubscription.useMutation({
			onSuccess: () => {
				toast({
					variant: "success",
					title: t(
						"settings.billing.cancelSubscription.notifications.success.title",
					),
				});
				router.refresh();
			},
			onError: () => {
				toast({
					variant: "error",
					title: t(
						"settings.billing.cancelSubscription.notifications.error.title",
					),
				});
			},
		});

	const cancelSubscription = async () => {
		try {
			await cancelSubscriptionMutation.mutateAsync({ id });
		} catch {
			// TODO: add error notification
		}
	};

	return (
		<Button
			variant="outline"
			onClick={() => cancelSubscription()}
			loading={cancelSubscriptionMutation.isPending}
		>
			<XIcon className="mr-2 size-4" />
			{label}
		</Button>
	);
}
