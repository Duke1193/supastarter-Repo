"use client";

import { useUser } from "@saas/auth/hooks/use-user";
import { UserAvatar } from "@shared/components/UserAvatar";
import { apiClient } from "@shared/lib/api-client";
import { LoaderIcon } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuid } from "uuid";
import { CropImageDialog } from "./CropImageDialog";

export function UserAvatarUpload({
	onSuccess,
	onError,
}: {
	onSuccess: () => void;
	onError: () => void;
}) {
	const { user, updateUser } = useUser();
	const [uploading, setUploading] = useState(false);
	const [cropDialogOpen, setCropDialogOpen] = useState(false);
	const [image, setImage] = useState<File | null>(null);

	const getSignedUploadUrlMutation =
		apiClient.uploads.signedUploadUrl.useMutation();
	const updateUserMutation = apiClient.auth.update.useMutation();

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

	if (!user) {
		return null;
	}

	const onCrop = async (croppedImageData: Blob | null) => {
		if (!croppedImageData) {
			return;
		}

		setUploading(true);
		try {
			const path = `${user.id}-${uuid()}.png`;
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

			const updatedUser = await updateUserMutation.mutateAsync({
				avatarUrl: path,
			});

			updateUser({
				avatarUrl: updatedUser.avatarUrl,
			});

			onSuccess();
		} catch (e) {
			onError();
		} finally {
			setUploading(false);
		}
	};

	return (
		<>
			<div className="relative rounded-full" {...getRootProps()}>
				<input {...getInputProps()} />
				<UserAvatar
					className="size-24 cursor-pointer text-xl"
					avatarUrl={user.avatarUrl}
					name={user.name ?? ""}
				/>

				{uploading && (
					<div className="absolute inset-0 z-20 flex items-center justify-center bg-card/90">
						<LoaderIcon className="size-6 animate-spin text-primary" />
					</div>
				)}
			</div>

			<CropImageDialog
				image={image}
				open={cropDialogOpen}
				onOpenChange={setCropDialogOpen}
				onCrop={onCrop}
			/>
		</>
	);
}
