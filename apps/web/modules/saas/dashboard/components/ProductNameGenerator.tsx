"use client";

import { apiClient } from "@shared/lib/api-client";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Wand2Icon } from "lucide-react";
import { useState } from "react";

export function ProductNameGenerator() {
	const [topic, setTopic] = useState("");
	const { refetch, data, isFetching } =
		apiClient.ai.generateProductNames.useQuery(
			{ topic },
			{
				enabled: false,
				refetchOnWindowFocus: false,
				refetchOnReconnect: false,
			},
		);

	return (
		<div>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					await refetch();
				}}
			>
				<label htmlFor="topic" className="mb-2 block font-bold">
					Topic
				</label>
				<Input
					id="topic"
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
				/>
				<Button className="mt-4 w-full" loading={isFetching}>
					<Wand2Icon className="mr-2 size-4" />
					Generate product names
				</Button>
			</form>

			{data && (
				<div className="mt-8 grid grid-cols-1 gap-2">
					{data?.map((name, i) => (
						<div className="rounded-md border bg-muted p-4" key={i}>
							{name}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
