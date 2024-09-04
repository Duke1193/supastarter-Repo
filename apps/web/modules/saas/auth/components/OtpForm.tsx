"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrors } from "@shared/hooks/form-errors";
import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import { Alert, AlertDescription } from "@ui/components/alert";
import { Button } from "@ui/components/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import type { UserOneTimePasswordTypeType } from "database";
import { AlertTriangleIcon, ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useUser } from "../hooks/use-user";
import { TeamInvitationInfo } from "./TeamInvitationInfo";

const formSchema = z.object({
	code: z.string().min(6).max(6),
});

type FormValues = z.infer<typeof formSchema>;

export function OtpForm() {
	const router = useRouter();
	const t = useTranslations();
	const { user, loaded } = useUser();
	const searchParams = useSearchParams();
	const { zodErrorMap, setApiErrorsToForm } = useFormErrors();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema, {
			errorMap: zodErrorMap,
		}),
	});

	const invitationCode = searchParams.get("invitationCode");
	const identifier = searchParams.get("identifier") ?? "";
	const type: UserOneTimePasswordTypeType = searchParams.get(
		"type",
	) as UserOneTimePasswordTypeType;
	const redirectTo = invitationCode
		? `/team/invitation?code=${invitationCode}`
		: searchParams.get("redirectTo") ?? "/app";

	const verifyOtpMutation = apiClient.auth.verifyOtp.useMutation();

	const handleRedirect = () => {
		router.replace(redirectTo);
	};

	useEffect(() => {
		if (user && loaded) {
			handleRedirect();
		}
	}, [user, loaded]);

	const onSubmit: SubmitHandler<FormValues> = async ({ code }) => {
		try {
			await verifyOtpMutation.mutateAsync({
				code,
				type,
				identifier,
			});

			handleRedirect();
		} catch (e) {
			setApiErrorsToForm(e, form, {
				defaultError: t("auth.verifyOtp.hints.verificationFailed"),
			});
		}
	};

	return (
		<div>
			<h1 className="font-bold text-3xl md:text-4xl">
				{t("auth.verifyOtp.title")}
			</h1>
			<p className="mt-2 mb-6 text-muted-foreground">
				{t("auth.verifyOtp.message")}
			</p>

			{invitationCode && <TeamInvitationInfo className="mb-6" />}

			<Form {...form}>
				<form
					className="flex flex-col items-stretch gap-8"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					{form.formState.isSubmitted &&
						form.formState.errors.root?.message && (
							<Alert variant="error">
								<AlertTriangleIcon className="size-6" />
								<AlertDescription>
									{form.formState.errors.root.message}
								</AlertDescription>
							</Alert>
						)}

					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormControl>
								<FormItem>
									<FormLabel>{t("auth.verifyOtp.otp")}</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="one-time-code" />
									</FormControl>
								</FormItem>
							</FormControl>
						)}
					/>

					<Button loading={form.formState.isSubmitting}>
						{t("auth.verifyOtp.submit")}
						<ArrowRightIcon className="ml-1 inline size-4 align-middle" />
					</Button>
				</form>
			</Form>
		</div>
	);
}
