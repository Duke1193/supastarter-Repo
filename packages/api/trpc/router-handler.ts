import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { logger } from "logs";
import { createContext } from "./context";
import { apiRouter } from "./router";

export const trpcApiRouteHandler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api",
		req,
		router: apiRouter,
		createContext,
		onError: ({ error }) => logger.error(error),
	});
