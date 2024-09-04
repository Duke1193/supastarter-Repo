"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@i18n";
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
	FormMessage,
} from "@ui/components/form";
import { Input } from "@ui/components/input";
import { passwordSchema } from "auth/lib/passwords";
import {
	AlertTriangleIcon,
	ArrowRightIcon,
	EyeIcon,
	EyeOffIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SocialSigninButton, oAuthProviders } from "./SocialSigninButton";
import { TeamInvitationInfo } from "./TeamInvitationInfo";

const formSchema = z.object({
	email: z.string().email(),
	password: passwordSchema,
});

type FormValues = z.infer<typeof formSchema>;

export function SignupForm() {
	const t = useTranslations();
	const { zodErrorMap, setApiErrorsToForm } = useFormErrors();
	const router = useRouter();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema, {
			errorMap: zodErrorMap,
		}),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const [showPassword, setShowPassword] = useState(false);
	const searchParams = useSearchParams();

	const signupMutation = apiClient.auth.signup.useMutation();

	const invitationCode = searchParams.get("invitationCode");
	const redirectTo = invitationCode
		? `/team/invitation?code=${invitationCode}`
		: searchParams.get("redirectTo") ?? "/app";
	const email = searchParams.get("email");

	useEffect(() => {
		if (email) {
			form.setValue("email", email);
		}
	}, [email]);

	const onSubmit: SubmitHandler<FormValues> = async ({ email, password }) => {
		try {
			await signupMutation.mutateAsync({
				email,
				password,
				callbackUrl: new URL("/auth/verify", window.location.origin).toString(),
			});

			const redirectSearchParams = new URLSearchParams();
			redirectSearchParams.set("type", "SIGNUP");
			redirectSearchParams.set("redirectTo", redirectTo);

			if (invitationCode) {
				redirectSearchParams.set("invitationCode", invitationCode);
			}

			if (email) {
				redirectSearchParams.set("identifier", email);
			}

			router.replace(`/auth/otp?${redirectSearchParams.toString()}`);
		} catch (e) {
			setApiErrorsToForm(e, form, {
				defaultError: t("auth.signup.hints.signupFailed"),
			});
		}
	};

	return (
		<div>
			<h1 className="font-bold text-3xl md:text-4xl">
				{t("auth.signup.title")}
			</h1>
			<p className="mt-2 mb-6 text-muted-foreground">
				{t("auth.signup.message")}
			</p>

			{invitationCode && <TeamInvitationInfo className="mb-6" />}

			<div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
				{Object.keys(oAuthProviders).map((providerId) => (
					<SocialSigninButton key={providerId} provider={providerId} />
				))}
			</div>

			<hr className="my-8" />

			<Form {...form}>
				<form
					className="flex flex-col items-stretch gap-6"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					{form.formState.isSubmitted && form.formState.errors.root && (
						<Alert variant="error">
							<AlertTriangleIcon className="size-6" />
							<AlertDescription>
								{form.formState.errors.root.message}
							</AlertDescription>
						</Alert>
					)}

					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.signup.email")}</FormLabel>
								<FormControl>
									<Input {...field} autoComplete="email" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>{t("auth.signup.password")}</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showPassword ? "text" : "password"}
											className="pr-10"
											{...field}
											autoComplete="new-password"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary text-xl"
										>
											{showPassword ? (
												<EyeOffIcon className="size-4" />
											) : (
												<EyeIcon className="size-4" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button loading={form.formState.isSubmitting}>
						{t("auth.signup.submit")}
					</Button>

					<div className="text-center text-sm">
						<span className="text-muted-foreground">
							{t("auth.signup.alreadyHaveAccount")}{" "}
						</span>
						<Link
							href={`/auth/login${
								invitationCode
									? `?invitationCode=${invitationCode}&email=${email}`
									: ""
							}`}
						>
							{t("auth.signup.signIn")}
							<ArrowRightIcon className="ml-1 inline size-4 align-middle" />
						</Link>
					</div>
				</form>
			</Form>
		</div>
	);
}
