import { Link, Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";
import type { BaseMailProps } from "../types";
import PrimaryButton from "./components/PrimaryButton";
import Wrapper from "./components/Wrapper";

export function ForgotPassword({
	url,
	name,
	otp,
	locale,
	translations,
}: {
	url: string;
	name: string;
	otp: string;
} & BaseMailProps): JSX.Element {
	const t = createTranslator({
		locale,
		messages: translations,
		namespace: "mail",
	});

	return (
		<Wrapper>
			<Text>{t("forgotPassword.body")}</Text>

			<Text>
				{t("common.otp")}
				<br />
				<strong className="font-bold text-2xl">{otp}</strong>
			</Text>

			<Text>{t("common.useLink")}</Text>

			<PrimaryButton href={url}>
				{t("forgotPassword.resetPassword")} &rarr;
			</PrimaryButton>

			<Text className="text-muted-foreground text-sm">
				{t("common.openLinkInBrowser")}
				<Link href={url}>{url}</Link>
			</Text>
		</Wrapper>
	);
}

export default ForgotPassword;
