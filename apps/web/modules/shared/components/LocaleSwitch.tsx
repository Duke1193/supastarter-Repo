"use client";

import { config } from "@config";
import { usePathname } from "@i18n";
import { useRouter } from "@shared/hooks/router";
import { Button } from "@ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import { LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const { locales } = config.i18n;

export function LocaleSwitch() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentLocale = useLocale();
	const [value, setValue] = useState<string>(currentLocale);

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Language">
					<LanguagesIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(value) => {
						setValue(value);
						router.replace(`/${value}/${pathname}?${searchParams.toString()}`);
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
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
