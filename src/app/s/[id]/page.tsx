"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SvgAtt from "@/components/svg/att";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function SharePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);
	const [loaded, setLoaded] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [videoFile, setVideoFile] = useState<File | null>(null);
	const [canShare, setCanShare] = useState(false);

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

	// Fetch video blob for sharing (only if browser supports file sharing)
	useEffect(() => {
		if (!file.data?.videoUrl) return;
		if (typeof navigator === "undefined" || !navigator.canShare) return;

		fetch(file.data.videoUrl)
			.then((res) => res.blob())
			.then((blob) => {
				const videoFile = new File([blob], `att-replay-${params.id}.mp4`, {
					type: "video/mp4",
				});
				// Check if this file can actually be shared
				try {
					if (navigator.canShare({ files: [videoFile] })) {
						setVideoFile(videoFile);
						setCanShare(true);
					}
				} catch {
					console.error("Cannot share this file type");
				}
			})
			.catch((err) => console.error("Failed to fetch video blob:", err));
	}, [file.data?.videoUrl, params.id]);

	const handlePlay = () => {
		if (videoRef.current) {
			videoRef.current.play();
			setIsPlaying(true);
		}
	};

	const handleShare = async () => {
		if (!videoFile) return;
		try {
			await navigator.share({
				title: "Check out my replay!",
				files: [videoFile],
			});
		} catch (err) {
			if ((err as Error).name !== "AbortError") {
				console.error("Share failed:", err);
			}
		}
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
		<main className="att flex min-h-screen flex-col items-center justify-center px-4 pt-0 pb-16">
			<div className="my-10">
				<SvgAtt className="w-[116px]" />
			</div>
			<div className="flex w-full max-w-4xl flex-col items-center">
				<h1 className="text-center">
					Bold moves.
					<br />
					Big moments.
				</h1>
				<div className="mt-3 mb-10">
					<p>Check out your replay below</p>
				</div>
				<div className="relative mx-auto flex w-full max-w-[70vw] flex-col items-center justify-center">
					{file.isPending && (
						<div className="flex items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
						</div>
					)}

					{file.error && (
						<div className="text-white">
							<p>Failed to load video</p>
						</div>
					)}

					{!file.isPending && file.data?.videoUrl && (
						<div className="relative aspect-[9/16] w-full overflow-hidden rounded-[20px] border border-white bg-black">
							<video
								ref={videoRef}
								className={`${loaded ? "opacity-100" : "opacity-0"} h-full w-full rounded-[20px] transition-opacity duration-300`}
								preload="auto"
								loop
								playsInline
								controls={isPlaying}
								onCanPlay={() => setLoaded(true)}
								onError={handleVideoError}
								onPause={() => setIsPlaying(false)}
								onPlay={() => setIsPlaying(true)}
							>
								<source src={`${file.data.videoUrl}#t=0.1`} type="video/mp4" />
								Your browser does not support the video tag.
							</video>
							{loaded && !isPlaying && (
								<button
									type="button"
									onClick={handlePlay}
									className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
								>
									<div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90">
										<svg
											className="size-12 text-att-blue"
											fill="currentColor"
											viewBox="0 0 24 24"
										>
											<path d="M8 5v14l11-7z" />
										</svg>
									</div>
								</button>
							)}
						</div>
					)}
				</div>
				{file.data?.downloadUrl && (
					<div className="mt-10 space-y-4 text-center">
						<Button variant="attOutline" size="attOutline" asChild>
							<a href={file.data.downloadUrl} download>
								Download
							</a>
						</Button>
						{canShare && (
							<Button
								variant="attOutline"
								size="attOutline"
								onClick={handleShare}
							>
								Share
							</Button>
						)}
					</div>
				)}
			</div>
		</main>
	);
}
