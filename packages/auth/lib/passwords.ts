import { z } from "zod";

export const passwordSchema = z
	.string()
	.min(8)
	.max(255)
	.refine((password) => /[A-Z]/.test(password), {
		params: {
			i18n: {
				key: "uppercase_character_required",
				values: {
					character: "A-Z",
				},
			},
		},
	})
	.refine((password) => /[a-z]/.test(password), {
		params: {
			i18n: {
				key: "lowercase_character_required",
				values: {
					character: "a-z",
				},
			},
		},
	})
	.refine((password) => /[0-9]/.test(password), {
		params: {
			i18n: {
				key: "number_required",
				values: {
					character: "0-9",
				},
			},
		},
	})
	.refine((password) => /[!@#$%^&*]/.test(password), {
		params: {
			i18n: {
				key: "special_character_required",
				values: {
					character: "!@#$%^&",
				},
			},
		},
	});
