import type { Locale } from "@config";
import { renderAsync } from "@react-email/render";
import { getMessagesForLocale } from "i18n/lib";
import type { Messages } from "i18n/types";
import { EmailChange } from "../emails/EmailChange";
import { ForgotPassword } from "../emails/ForgotPassword";
import { MagicLink } from "../emails/MagicLink";
import { NewUser } from "../emails/NewUser";
import { NewsletterSignup } from "../emails/NewsletterSignup";
import { TeamInvitation } from "../emails/TeamInvitation";

export const mailTemplates = {
	magicLink: MagicLink,
	forgotPassword: ForgotPassword,
	newUser: NewUser,
	newsletterSignup: NewsletterSignup,
	teamInvitation: TeamInvitation,
	emailChange: EmailChange,
};

export async function getTemplate<T extends TemplateId>({
	templateId,
	context,
	locale,
}: {
	templateId: T;
	context: Omit<
		Parameters<(typeof mailTemplates)[T]>[0],
		"locale" | "translations"
	>;
	locale: Locale;
}) {
	const template = mailTemplates[templateId];
	const translations = await getMessagesForLocale(locale);

	const email = template({
		...(context as any),
		locale,
		translations,
	});

	const subject =
		"subject" in translations.mail[templateId as keyof Messages["mail"]]
			? translations.mail[templateId].subject
			: "";

	const html = await renderAsync(email);
	const text = await renderAsync(email, { plainText: true });
	return { html, text, subject };
}

export type TemplateId = keyof typeof mailTemplates;
