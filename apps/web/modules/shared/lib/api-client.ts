import { createTRPCReact } from "@trpc/react-query";
import type { ApiRouter } from "api/trpc/router";

export const apiClient = createTRPCReact<ApiRouter>({});
