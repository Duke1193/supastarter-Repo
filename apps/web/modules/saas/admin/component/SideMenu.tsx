"use client";

import { Link, usePathname } from "@i18n";
import { cn } from "@ui/lib";
import type { ReactNode } from "react";

export function SideMenu({
	menuItems,
}: {
	menuItems: {
		title: string;
		href: string;
		icon: ReactNode;
	}[];
}) {
	const pathname = usePathname();

	const isActiveMenuItem = (href: string) => pathname.includes(href);

	return (
		<div className="space-y-8">
			<ul className="list-none">
				{menuItems.map((item, k) => {
					return (
						<li key={k}>
							<Link
								href={item.href}
								className={cn(
									"flex items-center gap-2 py-1.5",
									isActiveMenuItem(item.href) ? "font-bold" : "",
								)}
							>
								{item.icon}
								{item.title}
							</Link>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
