import { Container, Heading, Section, Text } from "@react-email/components";
import { createTranslator } from "use-intl/core";
import type { BaseMailProps } from "../types";
import Wrapper from "./components/Wrapper";

export function NewsletterSignup({
	locale,
	translations,
}: BaseMailProps): JSX.Element {
	const t = createTranslator({
		locale,
		messages: translations,
		namespace: "mail",
	});

	return (
		<Wrapper>
			<Section className="bg-card p-8">
				<Container>
					<Heading as="h1">{t("newsletterSignup.subject")}</Heading>
					<Text>{t("newsletterSignup.body")}</Text>
				</Container>
			</Section>
		</Wrapper>
	);
}

export default NewsletterSignup;
