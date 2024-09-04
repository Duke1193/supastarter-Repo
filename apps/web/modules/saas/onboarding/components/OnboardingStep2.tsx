"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@saas/auth/hooks/use-user";
import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	teamName: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingStep2({
	onCompleted,
	onBack,
}: {
	onCompleted: () => void;
	onBack: () => void;
}) {
	const t = useTranslations();
	const { user } = useUser();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			teamName: "",
		},
	});

	const createTeamMutation = apiClient.team.create.useMutation();

	const onSubmit: SubmitHandler<FormValues> = async ({ teamName }) => {
		form.clearErrors("root");

		try {
			await createTeamMutation.mutateAsync({
				name: teamName,
			});

			onCompleted();
		} catch (e) {
			form.setError("root", {
				type: "server",
				message: t("onboarding.notifications.accountSetupFailed"),
			});
		}
	};

	return (
		<div>
			{user?.teamMemberships?.length ? (
				<>
					<div className="flex flex-col items-stretch gap-4">
						<h3 className="font-bold text-xl">
							{t("onboarding.team.joinTeam")}
						</h3>
						<p className="text-muted-foreground">
							{t.rich("onboarding.team.joinTeamDescription", {
								teamName: user.teamMemberships[0].team.name,
								strong: (str) => <strong>{str}</strong>,
							})}
						</p>
						<Button
							type="submit"
							loading={form.formState.isSubmitting}
							onClick={() => onCompleted()}
						>
							<CheckIcon className="mr-2 size-4" />
							{t("onboarding.complete")}
						</Button>
					</div>
				</>
			) : (
				<>
					<h3 className="mb-4 font-bold text-xl">
						{t("onboarding.team.title")}
					</h3>
					<Form {...form}>
						<form
							className="flex flex-col items-stretch gap-8"
							onSubmit={form.handleSubmit(onSubmit)}
						>
							<FormField
								control={form.control}
								name="teamName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t("onboarding.team.name")}</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="flex gap-2">
								<Button
									className="flex-1"
									type="button"
									variant="outline"
									onClick={onBack}
								>
									<ArrowLeftIcon className="mr-2 size-4" />
									{t("onboarding.back")}
								</Button>
								<Button
									className="flex-1"
									type="submit"
									loading={form.formState.isSubmitting}
								>
									<CheckIcon className="mr-2 size-4" />
									{t("onboarding.complete")}
								</Button>
							</div>
						</form>
					</Form>
				</>
			)}
		</div>
	);
}
