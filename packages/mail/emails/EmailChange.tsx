import { Link, Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";
import type { BaseMailProps } from "../types";
import PrimaryButton from "./components/PrimaryButton";
import Wrapper from "./components/Wrapper";

export function EmailChange({
	url,
	name,
	locale,
	translations,
}: {
	url: string;
	name: string;
} & BaseMailProps): JSX.Element {
	const t = createTranslator({
		locale,
		messages: translations,
		namespace: "mail",
	});

	return (
		<Wrapper>
			<Text>{t("emailChange.body", { name })}</Text>

			<PrimaryButton href={url}>
				{t("emailChange.confirmEmail")} &rarr;
			</PrimaryButton>

			<Text className="text-muted-foreground text-sm">
				{t("common.openLinkInBrowser")}
				<Link href={url}>{url}</Link>
			</Text>
		</Wrapper>
	);
}

export default EmailChange;
