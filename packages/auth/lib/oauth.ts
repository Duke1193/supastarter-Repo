import { OAuth2RequestError } from "arctic";
import { db } from "database";
import { logger } from "logs";
import { cookies } from "next/headers";
import { lucia } from "./lucia";

export function createOauthRedirectHandler(
	providerId: string,
	createAuthorizationTokens: () => Promise<{
		state: string;
		codeVerifier?: string;
		url: URL;
	}>,
) {
	return async () => {
		const { url, state, codeVerifier } = await createAuthorizationTokens();

		cookies().set(`${providerId}_oauth_state`, state, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== "development",
			path: "/",
			maxAge: 60 * 60,
			sameSite: "lax",
		});

		if (codeVerifier) {
			// store code verifier as cookie
			cookies().set("code_verifier", codeVerifier, {
				secure: true, // set to false in localhost
				path: "/",
				httpOnly: true,
				maxAge: 60 * 10, // 10 min
			});
		}

		return Response.redirect(url);
	};
}

export function createOauthCallbackHandler(
	providerId: string,
	validateAuthorizationCode: (
		code: string,
		codeVerifier?: string,
	) => Promise<{
		email: string;
		name?: string;
		id: string;
		avatar?: string;
	}>,
) {
	return async (req: Request) => {
		const url = new URL(req.url);
		const code = url.searchParams.get("code");
		const state = url.searchParams.get("state");
		const storedState =
			cookies().get(`${providerId}_oauth_state`)?.value ?? null;
		const storedCodeVerifier = cookies().get("code_verifier")?.value ?? null;

		if (!code || !state || !storedState || state !== storedState) {
			logger.error(
				`Invalid state or code parameters for provider ${providerId}`,
			);

			return new Response(null, {
				status: 400,
			});
		}

		try {
			const oauthUser = await validateAuthorizationCode(
				code,
				storedCodeVerifier ?? undefined,
			);

			const existingUser = await db.user.findFirst({
				where: {
					OR: [
						{
							oauthAccounts: {
								some: {
									providerId,
									providerUserId: oauthUser.id,
								},
							},
						},
						{
							email: oauthUser.email.toLowerCase(),
						},
					],
				},
				select: {
					id: true,
					oauthAccounts: {
						select: {
							providerId: true,
						},
					},
				},
			});

			if (existingUser) {
				if (
					!existingUser.oauthAccounts.some(
						(account) => account.providerId === providerId,
					)
				) {
					await db.userOauthAccount.create({
						data: {
							providerId,
							providerUserId: oauthUser.id,
							userId: existingUser.id,
						},
					});
				}

				const session = await lucia.createSession(existingUser.id, {});
				const sessionCookie = lucia.createSessionCookie(session.id);
				cookies().set(
					sessionCookie.name,
					sessionCookie.value,
					sessionCookie.attributes,
				);
				return new Response(null, {
					status: 302,
					headers: {
						Location: "/app",
					},
				});
			}

			const newUser = await db.user.create({
				data: {
					email: oauthUser.email.toLowerCase(),
					emailVerified: true,
					name: oauthUser.name,
					avatarUrl: oauthUser.avatar,
				},
			});

			await db.userOauthAccount.create({
				data: {
					providerId,
					providerUserId: oauthUser.id,
					userId: newUser.id,
				},
			});
			const session = await lucia.createSession(newUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies().set(
				sessionCookie.name,
				sessionCookie.value,
				sessionCookie.attributes,
			);
			return new Response(null, {
				status: 302,
				headers: {
					Location: "/app",
				},
			});
		} catch (e) {
			logger.error("Could not handle oAuth request", e);

			if (e instanceof OAuth2RequestError) {
				return new Response(null, {
					status: 400,
				});
			}

			return new Response(null, {
				status: 500,
			});
		}
	};
}
