import Image from "next/image";

import { Button } from "@ui/components/button";
import {
	ArrowRightIcon,
	CloudIcon,
	MousePointerIcon,
	PaperclipIcon,
	PhoneIcon,
	StarIcon,
	UploadIcon,
} from "lucide-react";
import heroDarkImage from "../../../../public/images/hero-dark.svg";
import heroImage from "../../../../public/images/hero.svg";

export function Features() {
	return (
		<section className="py-24 text-card-foreground">
			<div className="container">
				{/* Section header */}
				<div className="text-center">
					<h1 className="font-bold text-4xl lg:text-5xl">
						Features your clients will love
					</h1>
					<p className="mt-3 text-foreground/60 text-lg">
						In this section you can showcase the features of your SaaS.
					</p>
				</div>

				<div className="mt-12 grid grid-cols-1 gap-8">
					{/* Feature 1 */}
					<div className="grid items-center gap-8 rounded-2xl border bg-card/50 p-8 lg:grid-cols-2 lg:gap-16">
						<div className="overflow-hidden rounded-xl bg-primary/10 p-12">
							<Image
								src={heroImage}
								className="block dark:hidden"
								alt="Feature 1"
							/>
							<Image
								src={heroDarkImage}
								className="hidden dark:block"
								alt="Feature 1"
							/>
						</div>

						<div>
							<h3 className="font-bold text-3xl">Feature A</h3>
							<p className="mt-2 text-foreground/60 leading-normal">
								This is a brilliant feature. And below you can see some reasons
								why. This is basically just a dummy text.
							</p>
							<Button variant="secondary" size="sm" className="mt-4">
								Learn more
								<ArrowRightIcon className="ml-2 size-4" />
							</Button>

							<div className="mt-6 grid grid-cols-2 gap-4">
								<div className="text-card-foreground">
									<StarIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 1</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
								<div className="text-card-foreground">
									<MousePointerIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 2</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Feature 2 */}
					<div className="grid items-center gap-8 rounded-2xl border bg-card/50 p-8 lg:grid-cols-2 lg:gap-16">
						<div className="overflow-hidden rounded-xl bg-primary/10 p-12 lg:order-2">
							<Image
								src={heroImage}
								className="block dark:hidden"
								alt="Feature 2"
							/>
							<Image
								src={heroDarkImage}
								className="hidden dark:block"
								alt="Feature 2"
							/>
						</div>

						<div className="lg:order-1">
							<h3 className="font-bold text-3xl">Feature B</h3>
							<p className="mt-2 text-foreground/60 leading-normal">
								This is a brilliant feature. And below you can see some reasons
								why. This is basically just a dummy text.
							</p>
							<Button variant="secondary" size="sm" className="mt-4">
								Learn more
								<ArrowRightIcon className="ml-2 size-4" />
							</Button>

							<div className="mt-6 grid grid-cols-2 gap-4">
								<div className="text-card-foreground">
									<UploadIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 1</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
								<div className="text-card-foreground">
									<CloudIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 2</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Feature 3 */}
					<div className="grid items-center gap-8 rounded-2xl border bg-card/50 p-8 lg:grid-cols-2 lg:gap-16">
						<div className="overflow-hidden rounded-xl bg-primary/10 p-12">
							<Image
								src={heroImage}
								className="block dark:hidden"
								alt="Feature 3"
							/>
							<Image
								src={heroDarkImage}
								className="hidden dark:block"
								alt="Feature 3"
							/>
						</div>

						<div>
							<h3 className="font-bold text-3xl">Feature C</h3>
							<p className="mt-2 text-foreground/60 leading-normal">
								This is a brilliant feature. And below you can see some reasons
								why. This is basically just a dummy text.
							</p>
							<Button variant="secondary" size="sm" className="mt-4">
								Learn more
								<ArrowRightIcon className="ml-2 size-4" />
							</Button>

							<div className="mt-6 grid grid-cols-2 gap-4">
								<div className="text-card-foreground">
									<PhoneIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 1</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
								<div className="text-card-foreground">
									<PaperclipIcon className="size-6 text-3xl text-highlight" />
									<strong className="mt-2 block">Benefit 2</strong>
									<p className="text-foreground/60">
										This is a brilliant benefit.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
