import { MDXContent } from "@content-collections/mdx/react";
import { redirect } from "@i18n";
import { mdxComponents } from "@marketing/blog/utils/mdx-components";
import { TableOfContents } from "@marketing/shared/components/TableOfContents";
import { getActivePathFromUrlParam } from "@shared/lib/content";
import { allDocumentationPages } from "content-collections";
import { getLocale } from "next-intl/server";

type Params = {
	path: string | string[];
};

export default async function DocsPage({
	params: { path },
}: {
	params: Params;
}) {
	const activePath = getActivePathFromUrlParam(path);
	const locale = await getLocale();

	const page = allDocumentationPages
		.filter((page) => page.path === activePath)
		.sort((page) => (page.locale === locale ? -1 : 1))[0];

	if (!page) {
		redirect("/");
	}

	const { title, subtitle, body, toc } = page;

	return (
		<div>
			<div className="mb-8">
				<h1 className="font-bold text-4xl">{title}</h1>

				{subtitle && (
					<p className="mt-3 text-2xl text-foreground/60">{subtitle}</p>
				)}
			</div>

			<div className="flex flex-col gap-6 lg:flex-row-reverse">
				{toc.length > 0 && <TableOfContents items={toc} />}
				<div className="flex-1 pb-8">
					<MDXContent code={body} components={mdxComponents} />
				</div>
			</div>
		</div>
	);
}
