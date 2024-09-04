"use client";

import { useUser } from "@saas/auth/hooks/use-user";
import { ActionBlock } from "@saas/shared/components/ActionBlock";
import { TeamAvatar } from "@shared/components/TeamAvatar";
import { apiClient } from "@shared/lib/api-client";
import { useToast } from "@ui/hooks/use-toast";
import { LoaderIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import { CropImageDialog } from "./CropImageDialog";

export function TeamAvatarForm() {
	const { toast } = useToast();
	const t = useTranslations();
	const [uploading, setUploading] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);
	const { teamMembership, reloadUser } = useUser();

	const getSignedUploadUrlMutation =
		apiClient.uploads.signedUploadUrl.useMutation();
	const updateTeamMutation = apiClient.team.update.useMutation();

	const { getRootProps, getInputProps } = useDropzone({
		onDrop: (acceptedFiles) => {
			setImage(acceptedFiles[0]);
			setCropDialogOpen(true);
		},
		accept: {
			"image/png": [".png"],
			"image/jpeg": [".jpg", ".jpeg"],
		},
		multiple: false,
	});

	if (!teamMembership?.team) {
		return null;
	}

	const { team } = teamMembership;

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}

		setUploading(true);
		try {
			const path = `/${team.id}-${uuid()}.png`;
			const uploadUrl = await getSignedUploadUrlMutation.mutateAsync({
				path,
				bucket: process.env.NEXT_PUBLIC_AVATARS_BUCKET_NAME as string,
			});

			const response = await fetch(uploadUrl, {
				method: "PUT",
				body: croppedImageData,
				headers: {
					"Content-Type": "image/png",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to upload image");
			}

			await updateTeamMutation.mutateAsync({
				id: team.id,
				avatarUrl: path,
			});

			toast({
				variant: "success",
				title: t("settings.notifications.avatarUpdated"),
			});

			await reloadUser();
		} catch (e) {
			toast({
				variant: "error",
				title: t("settings.notifications.avatarNotUpdated"),
			});
		} finally {
			setUploading(false);
		}
	};

	return (
		<ActionBlock title={t("settings.account.avatar.title")}>
			<div className="flex items-center gap-4">
				<div>
					<p>{t("settings.account.avatar.description")}</p>
				</div>

				<div className="relative rounded-full" {...getRootProps()}>
					<input {...getInputProps()} />
					<TeamAvatar
						className="size-24 cursor-pointer text-xl"
						avatarUrl={team.avatarUrl}
						name={team.name ?? ""}
					/>

					{uploading && (
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-card/90">
							<LoaderIcon className="size-6 animate-spin text-primary" />
						</div>
					)}
				</div>
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</ActionBlock>
	);
}
