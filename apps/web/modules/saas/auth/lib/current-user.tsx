import { CURRENT_TEAM_ID_COOKIE_NAME } from "@saas/shared/constants";
import { createApiCaller } from "api/trpc/caller";
import { cookies } from "next/headers";
import "server-only";

export const currentUser = async () => {
	const apiCaller = await createApiCaller();
	const user = await apiCaller.auth.user();

	if (!user) {
		return {
			user: null,
			team: null,
		};
	}

	const currentTeamId =
		cookies().get(CURRENT_TEAM_ID_COOKIE_NAME)?.value ?? null;

	const { teamMemberships } = user;

	const teamMembership =
		teamMemberships?.find(
			(membership) => membership.team.id === currentTeamId,
		) ?? teamMemberships?.[0];

	const team = teamMembership?.team || null;

	return {
		user,
		team,
		teamMembership,
	};
};
