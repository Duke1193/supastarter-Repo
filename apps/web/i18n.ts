import { type Locale, config } from "@config";
import { getMessagesForLocale } from "i18n/lib";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ locale }) => {
	if (!Object.keys(config.i18n.locales).includes(locale as Locale)) {
		notFound();
	}

	return {
		messages: await getMessagesForLocale(locale),
	};
});
