import { config } from "@config";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const { Link, redirect, usePathname, useRouter } =
	createSharedPathnamesNavigation({
		locales: Object.keys(config.i18n.locales),
		localePrefix: "never",
	});
