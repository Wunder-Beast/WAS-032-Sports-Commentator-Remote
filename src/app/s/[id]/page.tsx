"use client";

// import { useParams, useRouter } from "next/navigation";
// import { useCallback, useEffect, useState } from "react";
// import { api } from "@/trpc/react";

export default function SharePage() {
	// const params = useParams<{ id: string }>();
	// const router = useRouter();
	// const [loaded, setLoaded] = useState(false);

	// if (!params.id) {
	// 	router.replace("/");
	// }

	// const file = api.leadFiles.getLeadFileBlob.useQuery({ id: params.id ?? "" });

	// Helper function to check if URL expires within a given time
	// const urlExpiresWithin = useCallback(
	// 	(milliseconds: number): boolean => {
	// 		if (!file.data?.generatedAt) return false;
	// 		const expiryTime = file.data.generatedAt + 60 * 60 * 1000; // 1 hour from generation
	// 		return Date.now() + milliseconds >= expiryTime;
	// 	},
	// 	[file.data?.generatedAt],
	// );

	// // Handle file not found - redirect to home
	// useEffect(() => {
	// 	if (file.error?.message === "Video file not found") {
	// 		router.replace("/");
	// 	}
	// }, [file.error, router]);

	// // Auto-refresh on window focus if URL expires within 10 minutes
	// useEffect(() => {
	// 	const handleFocus = () => {
	// 		if (file.data && urlExpiresWithin(10 * 60 * 1000)) {
	// 			file.refetch();
	// 		}
	// 	};

	// 	window.addEventListener("focus", handleFocus);
	// 	return () => window.removeEventListener("focus", handleFocus);
	// }, [file.data, file.refetch, urlExpiresWithin]);

	// // Handle video load errors by refreshing the signed URL
	// const handleVideoError = () => {
	// 	console.log("Video failed to load, refreshing signed URL");
	// 	file.refetch();
	// };

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4">
			{/* <div className="flex w-full max-w-4xl flex-col items-center">
				<h1 className="mb-8 font-bold text-4xl">Share Video</h1>

				<div className="relative mx-auto flex aspect-video w-full flex-col items-center justify-center bg-black">
					{file.isPending && (
						<div className="flex items-center justify-center">
							<div className="h-8 w-8 animate-spin rounded-full border-white border-b-2" />
						</div>
					)}

					{!file.isPending && file.data?.fileUrl && (
						<video
							className={`${loaded ? "opacity-100" : "opacity-0"} h-full w-full transition-opacity duration-300`}
							preload="auto"
							loop
							playsInline
							controls
							onCanPlay={() => setLoaded(true)}
							onError={handleVideoError}
						>
							<source
								src={`${file.data.fileUrl}#t=0.1`}
								type={`video/${file.data.fileExtension}`}
							/>
							Your browser does not support the video tag.
						</video>
					)}
				</div>

				{!file.isPending && file.data?.downloadUrl && (
					<div className="mt-8">
						<a
							href={file.data.downloadUrl}
							download
							className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
						>
							Download Video
						</a>
					</div>
				)}
			</div> */}
		</main>
	);
}
