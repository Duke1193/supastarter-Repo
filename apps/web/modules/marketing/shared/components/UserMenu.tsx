"use client";

import { config } from "@config";
import { Link, usePathname } from "@i18n";
import { DropdownMenuSub } from "@radix-ui/react-dropdown-menu";
import { useUser } from "@saas/auth/hooks/use-user";
import { UserAvatar } from "@shared/components/UserAvatar";
import { useRouter } from "@shared/hooks/router";
import { apiClient } from "@shared/lib/api-client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { useToast } from "@ui/hooks/use-toast";
import {
	BookIcon,
	HardDriveIcon,
	LanguagesIcon,
	LogOutIcon,
	MoonIcon,
	SettingsIcon,
	SunIcon,
	UserRoundXIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const { locales } = config.i18n;

export function UserMenu() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentLocale = useLocale();
	const t = useTranslations();
	const { user, logout } = useUser();
	const { toast } = useToast();
	const [locale, setLocale] = useState<string>(currentLocale);
	const { setTheme: setCurrentTheme, theme: currentTheme } = useTheme();
	const [theme, setTheme] = useState<string>(currentTheme ?? "system");

	const unimpersonateMutation = apiClient.admin.unimpersonate.useMutation();

	const colorModeOptions = [
		{
			value: "system",
			label: "System",
			icon: HardDriveIcon,
		},
		{
			value: "light",
			label: "Light",
			icon: SunIcon,
		},
		{
			value: "dark",
			label: "Dark",
			icon: MoonIcon,
		},
	];

	if (!user) {
		return null;
	}

	const { name, email, avatarUrl } = user;

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
					aria-label="User menu"
				>
					<UserAvatar name={name ?? ""} avatarUrl={avatarUrl} />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				<DropdownMenuLabel>
					{name}
					<span className="block font-normal text-xs opacity-70">{email}</span>
				</DropdownMenuLabel>

				<DropdownMenuSeparator />

				{/* Color mode selection */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SunIcon className="mr-2 size-4" />
						{t("dashboard.userMenu.colorMode")}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={theme}
								onValueChange={(value) => {
									setTheme(value);
									setCurrentTheme(value);
								}}
							>
								{colorModeOptions.map((option) => (
									<DropdownMenuRadioItem
										key={option.value}
										value={option.value}
									>
										<option.icon className="mr-2 size-4 opacity-50" />
										{option.label}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				{/* Language selection */}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<LanguagesIcon className="mr-2 size-4" />
						{t("dashboard.userMenu.language")}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuRadioGroup
								value={locale}
								onValueChange={(value) => {
									setLocale(value);
									router.replace(
										`/${value}/${pathname}?${searchParams.toString()}`,
									);
								}}
							>
								{Object.entries(locales).map(([locale, { label }]) => {
									return (
										<DropdownMenuRadioItem key={locale} value={locale}>
											{label}
										</DropdownMenuRadioItem>
									);
								})}
							</DropdownMenuRadioGroup>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				<DropdownMenuItem asChild>
					<Link href="/app/settings/account/general">
						<SettingsIcon className="mr-2 size-4" />
						{t("dashboard.userMenu.accountSettings")}
					</Link>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<a
						href="https://docs.supastarter.dev"
						target="_blank"
						rel="noopener noreferrer"
					>
						<BookIcon className="mr-2 size-4" />
						{t("dashboard.userMenu.documentation")}
					</a>
				</DropdownMenuItem>

				{user.impersonatedBy && (
					<DropdownMenuItem
						onClick={async () => {
							const { dismiss } = toast({
								variant: "loading",
								title: t("admin.users.impersonation.unimpersonating"),
							});
							await unimpersonateMutation.mutateAsync();
							dismiss();
							window.location.reload();
						}}
					>
						<UserRoundXIcon className="mr-2 size-4" />
						{t("dashboard.userMenu.unimpersonate")}
					</DropdownMenuItem>
				)}

				<DropdownMenuItem onClick={logout}>
					<LogOutIcon className="mr-2 size-4" />
					{t("dashboard.userMenu.logout")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
