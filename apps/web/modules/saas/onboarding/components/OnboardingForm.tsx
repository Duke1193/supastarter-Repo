"use client";

import { useUser } from "@saas/auth/hooks/use-user";
import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import { clearCache } from "@shared/lib/cache";
import { Progress } from "@ui/components/progress";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";

export function OnboardingForm() {
	const { updateUser } = useUser();
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();

	const totalSteps = 2;
	const stepSearchParam = searchParams.get("step");
	const onboardingStep = stepSearchParam
		? Number.parseInt(stepSearchParam, 10)
		: 1;

	const updateUserMutation = apiClient.auth.update.useMutation();

	const setStep = (step: number) => {
		router.replace(`?step=${step}`);
	};

	const onCompleted = async () => {
		await updateUserMutation.mutateAsync({
			onboardingComplete: true,
		});

		updateUser({
			onboardingComplete: true,
		});

		await clearCache();
		router.replace("/app/dashboard");
	};

	return (
		<div>
			<h1 className="font-bold text-3xl md:text-4xl">
				{t("onboarding.title")}
			</h1>
			<p className="mt-2 mb-6 text-muted-foreground">
				{t("onboarding.message")}
			</p>

			<div className="mb-6 flex items-center gap-3">
				<Progress value={(onboardingStep / totalSteps) * 100} className="h-2" />
				<span className="shrink-0 text-muted-foreground text-xs">
					{t("onboarding.step", {
						step: onboardingStep,
						total: totalSteps,
					})}
				</span>
			</div>

			{onboardingStep === 1 && (
				<OnboardingStep1 onCompleted={() => setStep(2)} />
			)}
			{onboardingStep === 2 && (
				<OnboardingStep2 onCompleted={onCompleted} onBack={() => setStep(1)} />
			)}
		</div>
	);
}
