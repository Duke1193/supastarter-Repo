import { Link } from "@i18n";

export function Footer() {
	return (
		<footer className="container py-4 text-center text-muted-foreground text-sm">
			<span>
				© {new Date().getFullYear()} supastarter. All rights reserved.
			</span>
			<span className="opacity-50"> | </span>
			<Link href="/legal/privacy-policy">Privacy policy</Link>
			<span className="opacity-50"> | </span>
			<Link href="/legal/terms">Terms and conditions</Link>
		</footer>
	);
}
