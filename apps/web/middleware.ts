import { config as projectConfig } from "@config";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
	locales: Object.keys(projectConfig.i18n.locales),
	defaultLocale: projectConfig.i18n.defaultLocale,
	localePrefix: "never",
});

export default async function middleware(req: NextRequest) {
	return intlMiddleware(req);
}

export const config = {
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
