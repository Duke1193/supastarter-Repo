import { useRouter as useBaseRouter, usePathname } from "@i18n";
import type { NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import NProgress from "nprogress";
import { useCallback, useEffect } from "react";

export const useRouter = () => {
	const router = useBaseRouter();
	const pathname = usePathname();
	useEffect(() => {
		NProgress.done();
	}, [pathname]);
	const replace = useCallback(
		(href: string, options?: NavigateOptions) => {
			href !== pathname && NProgress.start();
			router.replace(href, options);
		},
		[router, pathname],
	);

	const push = useCallback(
		(href: string, options?: NavigateOptions) => {
			href !== pathname && NProgress.start();
			router.push(href, options);
		},
		[router, pathname],
	);

	return {
		...router,
		replace,
		push,
	};
};
