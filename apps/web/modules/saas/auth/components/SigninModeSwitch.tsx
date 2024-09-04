"use client";

import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs";
import { useTranslations } from "next-intl";

export default function SigninModeSwitch({
	activeMode,
	onChange,
	className,
}: {
	activeMode: "password" | "magic-link";
	onChange: (mode: string) => void;
	className?: string;
}) {
	const t = useTranslations();
	return (
		<Tabs value={activeMode} onValueChange={onChange} className={className}>
			<TabsList className="w-full">
				<TabsTrigger value="magic-link" className="flex-1">
					{t("auth.login.modes.magicLink")}
				</TabsTrigger>
				<TabsTrigger value="password" className="flex-1">
					{t("auth.login.modes.password")}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
