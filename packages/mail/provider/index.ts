import { type Config, config } from "@config";
import type { MailProvider } from "../types";

export async function getProvider() {
	const providerResolvers = {
		console: () => import("./console"),
		custom: () => import("./custom"),
		postmark: () => import("./postmark"),
		resend: () => import("./resend"),
		nodemailer: () => import("./nodemailer"),
		plunk: () => import("./plunk"),
	} satisfies Record<
		Config["mailing"]["provider"],
		() => Promise<MailProvider>
	>;
	return await providerResolvers[config.mailing.provider]();
}
