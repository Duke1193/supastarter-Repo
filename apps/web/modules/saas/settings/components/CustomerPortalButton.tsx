"use client";

import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { useToast } from "@ui/hooks/use-toast";
import { CreditCardIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function CustomerPortalButton({
	subscriptionId,
}: {
	subscriptionId: string;
}) {
	const t = useTranslations();
	const { toast } = useToast();
	const createCustomerPortalMutation =
		apiClient.billing.createCustomerPortalLink.useMutation({
			onError: () => {
				toast({
					variant: "error",
					title: t(
						"settings.billing.createCustomerPortal.notifications.error.title",
					),
				});
			},
		});

	const createCustomerPortal = async () => {
		try {
			const url = await createCustomerPortalMutation.mutateAsync({
				subscriptionId,
				redirectUrl: window.location.href,
			});

			window.location.href = url;
		} catch {
			// TODO: add error notification
		}
	};

	return (
		<Button
			variant="default"
			onClick={() => createCustomerPortal()}
			loading={createCustomerPortalMutation.isPending}
		>
			<CreditCardIcon className="mr-2 size-4" />
			{t("settings.billing.createCustomerPortal.label")}
		</Button>
	);
}
