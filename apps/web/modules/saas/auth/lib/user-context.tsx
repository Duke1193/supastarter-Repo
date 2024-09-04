"use client";

import { config } from "@config";
import { apiClient } from "@shared/lib/api-client";
import { clearCache } from "@shared/lib/cache";
import type { ApiOutput } from "api/trpc/router";
import type { PropsWithChildren } from "react";
import { createContext, useEffect, useState } from "react";

type User = ApiOutput["auth"]["user"];
type TeamMembership = NonNullable<
	NonNullable<ApiOutput["auth"]["user"]>["teamMemberships"]
>[number];

type UserContext = {
	user: User;
	reloadUser: () => Promise<void>;
	updateUser: (info: Partial<User>) => void;
	logout: () => Promise<void>;
	loaded: boolean;
	teamMembership: TeamMembership | null;
};

const authBroadcastChannel = new BroadcastChannel("auth");
type AuthEvent = {
	type: "loaded" | "logout";
	user: User | null;
};

export const userContext = createContext<UserContext>({
	user: null,
	reloadUser: () => Promise.resolve(),
	updateUser: () => {
		return;
	},
	logout: () => Promise.resolve(),
	loaded: false,
	teamMembership: null,
});

export function UserContextProvider({
	children,
	initialUser,
	teamMembership,
}: PropsWithChildren<{
	initialUser: User;
	teamMembership?: TeamMembership;
}>) {
	const [loaded, setLoaded] = useState(!!initialUser);
	const [user, setUser] = useState<User>(initialUser);
	const userQuery = apiClient.auth.user.useQuery(undefined, {
		refetchOnWindowFocus: false,
		refetchOnMount: true,
		enabled: !initialUser,
	});
	const logoutMutation = apiClient.auth.logout.useMutation();

	const reloadUser = async () => {
		await userQuery.refetch();
	};

	const logout = async () => {
		await logoutMutation.mutateAsync();
		await clearCache();

		authBroadcastChannel.postMessage({
			type: "logout",
			user: null,
		} satisfies AuthEvent);

		window.location.href = config.auth.redirectAfterLogout;
	};

	useEffect(() => {
		if (userQuery.data) {
			setUser(userQuery.data);
		}
	}, [userQuery.data]);

	useEffect(() => {
		if (userQuery.isSuccess) {
			setLoaded(true);
		}
	}, [userQuery.isSuccess]);

	useEffect(() => {
		if (user && loaded) {
			authBroadcastChannel.postMessage({
				type: "loaded",
				user: user,
			});
		}
	}, [user, loaded]);

	useEffect(() => {
		const handleAuthEvent = (event: MessageEvent<AuthEvent>) => {
			if (JSON.stringify(event.data.user) !== JSON.stringify(user)) {
				if (event.data.type === "logout") {
					window.location.href = config.auth.redirectAfterLogout;
				} else if (event.data.type === "loaded") {
					setUser(event.data.user);
				}
			}
		};

		authBroadcastChannel.addEventListener("message", handleAuthEvent);

		return () =>
			authBroadcastChannel.removeEventListener("message", handleAuthEvent);
	}, [user]);

	const updateUser = (info: Partial<User>) => {
		if (user) {
			setUser({
				...user,
				...info,
			});
		}
	};

	return (
		<userContext.Provider
			value={{
				user,
				reloadUser,
				logout,
				loaded,
				updateUser,
				teamMembership: teamMembership ?? null,
			}}
		>
			{children}
		</userContext.Provider>
	);
}
