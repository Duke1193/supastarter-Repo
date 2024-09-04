import { type Locale, config } from "@config";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { lucia } from "auth";
import { db } from "database";
import { cookies } from "next/headers";
import { getSignedUrl } from "storage";
import { defineAbilitiesFor } from "../modules/auth/abilities";

export async function createContext(
	params?: FetchCreateContextFnOptions | { isAdmin?: boolean },
) {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
	const { user, session } = sessionId
		? await lucia.validateSession(sessionId)
		: { user: null, session: null };

	const teamMemberships = user
		? await Promise.all(
				(
					await db.teamMembership.findMany({
						where: {
							userId: user.id,
						},
						include: {
							team: true,
						},
					})
				).map(async (membership) => ({
					...membership,
					team: {
						...membership.team,
						avatarUrl: membership.team.avatarUrl
							? await getSignedUrl(membership.team.avatarUrl, {
									bucket: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME as string,
									expiresIn: 360,
								})
							: null,
					},
				})),
			)
		: null;

	const abilities = defineAbilitiesFor({
		user,
		teamMemberships,
	});

	const locale = (cookies().get(config.i18n.cookieName)?.value ??
		config.i18n.defaultLocale) as Locale;

	return {
		user,
		teamMemberships,
		abilities,
		session,
		locale,
		responseHeaders:
			params && "resHeaders" in params ? params.resHeaders : undefined,
		isAdmin: params && "isAdmin" in params ? params.isAdmin : false,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
