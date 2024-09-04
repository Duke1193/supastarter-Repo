import { Button } from "@react-email/components";
import type { PropsWithChildren } from "react";

export default function PrimaryButton({
	href,
	children,
}: PropsWithChildren<{
	href: string;
}>) {
	return (
		<Button
			href={href}
			className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
		>
			{children}
		</Button>
	);
}
