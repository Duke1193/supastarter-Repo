import { Link } from "@i18n";
import { UserContextProvider } from "@saas/auth/lib/user-context";
import { Footer } from "@saas/shared/components/Footer";
import { ColorModeToggle } from "@shared/components/ColorModeToggle";
import { LocaleSwitch } from "@shared/components/LocaleSwitch";
import { Logo } from "@shared/components/Logo";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({ children }: PropsWithChildren) {
	return (
		<UserContextProvider initialUser={null}>
			<div className="flex min-h-screen w-full p-8">
				<div className="flex w-full flex-col items-center justify-between gap-8">
					<div className="container">
						<div className="flex items-center justify-between">
							<Link href="/" className="block">
								<Logo />
							</Link>

							<div className="flex items-center justify-end gap-2">
								<LocaleSwitch />
								<ColorModeToggle />
							</div>
						</div>
					</div>

					<main className="w-full max-w-md">{children}</main>

					<Footer />
				</div>
			</div>
		</UserContextProvider>
	);
}
