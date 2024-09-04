"use client";

import { useLocaleCurrency } from "@shared/hooks/locale-currency";
import { Button } from "@ui/components/button";
import { Tabs, TabsList, TabsTrigger } from "@ui/components/tabs";
import { cn } from "@ui/lib";
import type { ApiOutput } from "api/trpc/router";
import { useMemo, useState } from "react";

type SubscriptionPlan = ApiOutput["billing"]["plans"][number] & {
	features?: string[];
};

export function PricingTable({
	plans,
	activePlanId,
	onSelectPlan,
	labels,
	className,
}: {
	plans: SubscriptionPlan[];
	activePlanId?: string;
	onSelectPlan: (planId: string, variantId: string) => void | Promise<void>;
	className?: string;
	labels: {
		yearly: string;
		monthly: string;
		month: string;
		year: string;
		subscribe: string;
		currentPlan?: string;
		switchToPlan?: string;
	};
}) {
	const localeCurrency = useLocaleCurrency();
	const [interval, setInterval] = useState<"month" | "year">("month");
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

	const sortedAndFilteredPlans = useMemo(() => {
		return [...plans]
			.map((plan) => {
				const variants = plan.variants
					.filter(
						(v) =>
							v.interval === interval &&
							v.currency.toLowerCase() === localeCurrency.toLowerCase(),
					)
					.sort((a, b) => a.price - b.price);

				return {
					...plan,
					variants,
				};
			})
			.filter((plan) => plan.variants.length > 0)
			.sort((a, b) => {
				const lowestPriceA = a.variants.reduce(
					(lowest, variant) => Math.min(lowest, variant.price),
					Number.POSITIVE_INFINITY,
				);
				const lowestPriceB = b.variants.reduce(
					(lowest, variant) => Math.min(lowest, variant.price),
					Number.POSITIVE_INFINITY,
				);

				return lowestPriceA - lowestPriceB;
			});
	}, [plans, interval, localeCurrency]);

	const isActivePlan = (plan: (typeof plans)[number]) => {
		return activePlanId === plan.id;
	};

	return (
		<div className={cn(className, "@container")}>
			<div className="flex justify-center">
				<Tabs
					value={interval}
					onValueChange={(value) => setInterval(value as typeof interval)}
					className="mb-4"
					data-test="price-table-interval-tabs"
				>
					<TabsList>
						<TabsTrigger value="month">{labels.monthly}</TabsTrigger>
						<TabsTrigger value="year">{labels.yearly}</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="grid @md:grid-cols-3 gap-4">
				{sortedAndFilteredPlans.map((plan) => {
					const variant = plan.variants.find((v) => v.interval === interval);

					if (!variant) {
						return null;
					}

					return (
						<div
							key={plan.id}
							className="rounded-xl bg-card/50 p-6 shadow"
							data-test="price-table-plan"
						>
							<div className="flex h-full flex-col justify-between gap-4">
								<div>
									<h3 className="mb-4 font-bold text-2xl">{plan.name}</h3>
									{plan.description && (
										<div
											className="prose mb-2 text-muted-foreground"
											// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
											dangerouslySetInnerHTML={{ __html: plan.description }}
										/>
									)}

									{!!plan.features?.length && (
										<ul className="grid list-disc gap-2 pl-4 text-muted-foreground">
											{plan.features.map((feature, key) => (
												<li key={key}>{feature}</li>
											))}
										</ul>
									)}
								</div>

								<div>
									<strong
										className="font-bold text-2xl text-highlight"
										data-test="price-table-plan-price"
									>
										{Intl.NumberFormat("en-US", {
											style: "currency",
											currency: variant.currency,
										}).format(variant.price / 100)}
										<span className="font-normal text-sm opacity-70">
											{" / "}
											{labels[interval]}
										</span>
									</strong>

									<Button
										disabled={isActivePlan(plan)}
										loading={selectedPlan === plan.id}
										className="mt-6 w-full"
										onClick={async () => {
											setSelectedPlan(plan.id);
											await onSelectPlan(plan.id, String(variant.id));
											setSelectedPlan(null);
										}}
									>
										{isActivePlan(plan)
											? labels.currentPlan
											: activePlanId
												? labels.switchToPlan
												: labels.subscribe}
									</Button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
