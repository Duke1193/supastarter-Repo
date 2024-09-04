const { withContentCollections } = require("@content-collections/next");
const nextIntlPlugin = require("next-intl/plugin");

const withNextIntl = nextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["api", "auth"],
	images: {
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// github profile images
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/app",
				destination: "/app/dashboard",
				permanent: true,
			},
			{
				source: "/app/settings",
				destination: "/app/settings/account/general",
				permanent: true,
			},
			{
				source: "/app/admin",
				destination: "/app/admin/users",
				permanent: true,
			},
		];
	},
	webpack: (config) => {
		config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
		return config;
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

module.exports = withContentCollections(withNextIntl(nextConfig));
