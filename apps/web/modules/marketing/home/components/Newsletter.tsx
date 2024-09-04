"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@shared/lib/api-client";
import { Alert, AlertDescription, AlertTitle } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { CheckCircleIcon, KeyIcon } from "lucide-react";

import { useTranslations } from "next-intl";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email(),
});
type FormValues = z.infer<typeof formSchema>;

export function Newsletter() {
	const t = useTranslations();
	const newsletterSignupMutation = apiClient.newsletter.signup.useMutation();

	const {
		handleSubmit,
		register,
		formState: { isSubmitSuccessful },
	} = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

	const onSubmit: SubmitHandler<FormValues> = async ({ email }) => {
		try {
			await newsletterSignupMutation.mutateAsync({ email });
		} catch {
			// TODO: handle error
		}
	};

	return (
		<section className="py-24">
			<div className="container">
				<div className="mb-12 text-center">
					<KeyIcon className="mx-auto mb-3 size-12 text-primary" />
					<h1 className="font-bold text-3xl lg:text-4xl">
						{t("newsletter.title")}
					</h1>
					<p className="mt-3 text-lg opacity-70">{t("newsletter.subtitle")}</p>
				</div>

				<div className="mx-auto max-w-lg">
					{isSubmitSuccessful ? (
						<Alert variant="success">
							<CheckCircleIcon className="size-6" />
							<AlertTitle>{t("newsletter.hints.success.title")}</AlertTitle>
							<AlertDescription>
								{t("newsletter.hints.success.message")}
							</AlertDescription>
						</Alert>
					) : (
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex items-start">
								<Input
									type="email"
									required
									placeholder={t("newsletter.email")}
									{...register("email")}
								/>
								<Button type="submit" className="ml-4">
									{t("newsletter.submit")}
								</Button>
							</div>
						</form>
					)}
				</div>
			</div>
		</section>
	);
}
