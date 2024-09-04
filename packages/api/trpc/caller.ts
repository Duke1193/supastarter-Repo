import { createCallerFactory } from "./base";
import { createContext } from "./context";
import { apiRouter } from "./router";

export const createApiCaller = async () => {
	const context = await createContext();
	return createCallerFactory(apiRouter)(context);
};

export const createAdminApiCaller = async () => {
	const context = await createContext({ isAdmin: true });
	return createCallerFactory(apiRouter)(context);
};
