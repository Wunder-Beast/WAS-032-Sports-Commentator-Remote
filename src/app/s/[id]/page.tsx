"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/trpc/react";

export default function SharePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const [loaded, setLoaded] = useState(false);

	const file = api.leadFiles.getPublicFileInfo.useQuery(
		{ id: params.id ?? "" },
		{ enabled: !!params.id },
	);

	// Handle file not found - redirect to home
	useEffect(() => {
		if (file.error?.data?.code === "NOT_FOUND") {
			router.replace("/");
		}
	}, [file.error, router]);

	// Helper function to check if we should refresh
	const shouldRefresh = useCallback((): boolean => {
		if (!file.dataUpdatedAt) return false;
		const timeSinceUpdate = Date.now() - file.dataUpdatedAt;
		// Refresh if data is older than 50 minutes (URL expires in 1 hour)
		return timeSinceUpdate > 50 * 60 * 1000;
	}, [file.dataUpdatedAt]);

	// Auto-refresh on window focus if URL might be expiring
	useEffect(() => {
		const handleFocus = () => {
			if (file.data?.videoUrl && shouldRefresh()) {
				file.refetch();
			}
		};

		window.addEventListener("focus", handleFocus);
		return () => window.removeEventListener("focus", handleFocus);
	}, [file.data, file.refetch, shouldRefresh]);

	// Handle video load errors by refreshing the signed URL
	const handleVideoError = () => {
		console.log("Video failed to load, refreshing signed URL");
		file.refetch();
	};

	// Video unavailable (rejected or pending)
	if (file.data && file.data.moderationStatus !== "approved") {
		return (
			<main className="att flex min-h-screen flex-col items-center justify-center p-4">
				<div className="flex w-full max-w-md flex-col items-center text-center">
					<h1 className="mb-4 font-bold text-2xl">Video Unavailable</h1>
					<p className="text-muted-foreground">
						This video is no longer available.
					</p>
				</div>
			</main>
		);
	}

	return (
		<main className="att flex min-h-screen flex-col items-center justify-center p-4">
			<div className="flex w-full max-w-4xl flex-col items-center">
				<h1 className="mb-8 font-bold text-4xl">Your Video</h1>

				<div className="relative mx-auto flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-black">
					{file.isPending && (
						<div className="flex items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
						</div>
					)}

					{file.error && <div className="text-white">Failed to load video</div>}

					{!file.isPending && file.data?.videoUrl && (
						<video
							className={`${loaded ? "opacity-100" : "opacity-0"} h-full w-full rounded-lg transition-opacity duration-300`}
							preload="auto"
							loop
							playsInline
							controls
							onCanPlay={() => setLoaded(true)}
							onError={handleVideoError}
						>
							<source src={`${file.data.videoUrl}#t=0.1`} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					)}
				</div>
			</div>
		</main>
	);
}
