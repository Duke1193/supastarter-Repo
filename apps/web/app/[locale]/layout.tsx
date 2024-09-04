import { AnalyticsScript } from "@analytics";
import { Toaster } from "@ui/components/toaster";
import { cn } from "@ui/lib";
import { Provider as JotaiProvider } from "jotai";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Poppins } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { GradientBackgroundWrapper } from "@shared/components/GradientBackgroundWrapper";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		absolute: "supastarter.nextjs - Application",
		default: "supastarter.nextjs- Application",
		template: "%s | supastarter.nextjs - Application",
	},
};

const sansFont = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-sans",
});

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale}>
			<body
				className={cn(
					"min-h-screen bg-background font-sans text-foreground antialiased",
					sansFont.variable,
				)}
			>
				<NextTopLoader color="var(--colors-primary)" />
				<NextIntlClientProvider locale={locale} messages={messages}>
					<ThemeProvider attribute="class">
						<ApiClientProvider>
							<JotaiProvider>
								<GradientBackgroundWrapper>
									{children}
								</GradientBackgroundWrapper>
							</JotaiProvider>
						</ApiClientProvider>
					</ThemeProvider>
					<Toaster />
				</NextIntlClientProvider>
				<AnalyticsScript />
			</body>
		</html>
	);
}
