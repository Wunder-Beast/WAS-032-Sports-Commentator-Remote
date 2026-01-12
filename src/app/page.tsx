"use client";

import { useEffect, useRef, useState } from "react";
import {
	SlidePanel,
	SliderContainer,
	SliderProvider,
	useFullSlider,
} from "@/components/FullSlider";
import {
	VideoPlayer,
	VideoPlayerContent,
	VideoPlayerControlBar,
	VideoPlayerFullscreenButton,
	VideoPlayerMuteButton,
	VideoPlayerPlayButton,
	VideoPlayerTimeRange,
} from "@/components/kibo-ui/video-player";
import SvgAtt from "@/components/svg/att";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselDots,
	CarouselItem,
} from "@/components/ui/carousel";
import { useIsLandscape, useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/trpc/react";
import { LeadForm } from "./_components/leadForm";
import { ReturningUserForm } from "./_components/returning-user-form";

function HomeContent() {
	const isMobile = useIsMobile();
	const isLandscape = useIsLandscape();
	const { nextSlide, previousSlide, currentSlide } = useFullSlider();
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [isReturning, setIsReturning] = useState(false);
	const [returningUserId, setReturningUserId] = useState<string | null>(null);
	const [agePassed, setAgePassed] = useState(false);
	const [play, setPlay] = useState(0);
	const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

	// Lock to landscape when entering fullscreen
	useEffect(() => {
		const orientation = screen.orientation as ScreenOrientation & {
			lock?: (orientation: string) => Promise<void>;
			unlock?: () => void;
		};

		const handleFullscreenChange = async () => {
			if (document.fullscreenElement) {
				try {
					await orientation.lock?.("landscape");
				} catch {
					// Orientation lock not supported or failed
				}
			} else {
				try {
					orientation.unlock?.();
				} catch {
					// Orientation unlock not supported
				}
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	// Show mobile experience: touchscreen AND (portrait OR past slide 0)
	const showMobileExperience = isMobile && (!isLandscape || currentSlide > 0);

	// Calculate slide indices
	const choosePlaySlideIndex = isReturning ? 2 : 1;
	const finalSlideIndex = isReturning ? 3 : 4;
	const isOnFinalSlide = currentSlide === finalSlideIndex;

	// Show landscape overlay when past first slide, in landscape, and not on final slide
	const showLandscapeOverlay =
		isMobile && currentSlide > 0 && isLandscape && !isOnFinalSlide;

	const updatePlay = api.lead.updatePlay.useMutation();

	// Video playback control for carousel
	const isOnChoosePlaySlide = currentSlide === choosePlaySlideIndex;
	const wasOnSlideRef = useRef(false);

	// When arriving at the slide, wait for transition then play
	useEffect(() => {
		if (isOnChoosePlaySlide && !wasOnSlideRef.current) {
			wasOnSlideRef.current = true;
			const timer = setTimeout(() => {
				videoRefs.current[play]?.play();
			}, 500);
			return () => clearTimeout(timer);
		}
		if (!isOnChoosePlaySlide) {
			wasOnSlideRef.current = false;
			// Stop all videos when leaving the slide
			for (const video of videoRefs.current) {
				if (video) {
					video.pause();
					video.currentTime = 0;
				}
			}
		}
	}, [isOnChoosePlaySlide, play]);

	// When switching between carousel items while on the slide
	useEffect(() => {
		if (isOnChoosePlaySlide && wasOnSlideRef.current && !showLandscapeOverlay) {
			for (const video of videoRefs.current) {
				if (video) {
					video.pause();
					video.currentTime = 0;
				}
			}
			// Small delay to ensure video is ready after swipe settles
			const timer = setTimeout(() => {
				videoRefs.current[play]?.play();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [play, isOnChoosePlaySlide, showLandscapeOverlay]);

	// Pause/resume video when landscape overlay shows/hides
	useEffect(() => {
		if (!isOnChoosePlaySlide) return;

		if (showLandscapeOverlay) {
			videoRefs.current[play]?.pause();
		} else {
			videoRefs.current[play]?.play();
		}
	}, [showLandscapeOverlay, isOnChoosePlaySlide, play]);

	useEffect(() => {
		if (!carouselApi) return;

		const onSelect = () => {
			setPlay(carouselApi.selectedScrollSnap());
		};

		// Use both select (for immediate UI update) and settle (for video playback)
		carouselApi.on("select", onSelect);
		carouselApi.on("settle", onSelect);
		return () => {
			carouselApi.off("select", onSelect);
			carouselApi.off("settle", onSelect);
		};
	}, [carouselApi]);

	return (
		<main className="att relative flex min-h-dvh flex-col justify-center">
			{showLandscapeOverlay && (
				<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-att-gradient text-center">
					<div className="absolute top-[48px]">
						<SvgAtt className="mb-10 w-[116px]" />
					</div>
					<div className="mt-[48px] px-10">
						<h2>Please rotate your device</h2>
						<p className="mt-4">
							Rotate your phone back to portrait mode to continue.
						</p>
					</div>
					<img
						src="/rotate.png"
						alt="Rotate device"
						className="mt-10 w-16 animate-pulse"
					/>
				</div>
			)}
			{showMobileExperience ? (
				<SliderContainer>
					<SlidePanel>
						<div className="flex h-full flex-col">
							<div
								className="aspect-square w-full bg-center bg-cover"
								style={{ backgroundImage: "url('/hero.jpg')" }}
							/>
							<div className="-mt-[93px] flex flex-grow flex-col items-center rounded-t-[51px] bg-att-gradient px-5 pb-5 text-center">
								<div className="my-10">
									<SvgAtt className="w-[116px]" />
								</div>
								<h1>
									Ready to make
									<br />
									the big call?
								</h1>
								<p className="mt-5 px-11">
									Step into the broadcast booth and call the play by play for
									college football's biggest moments.
								</p>
								<div className="my-11 flex flex-col gap-5">
									<Button
										variant="attOutline"
										size="attOutline"
										onClick={() => {
											setIsReturning(false);
											setTimeout(() => {
												nextSlide();
											}, 10);
										}}
									>
										New user
									</Button>
									<Button
										variant="attOutline"
										size="attOutline"
										onClick={() => {
											setIsReturning(true);
											setTimeout(() => {
												nextSlide();
											}, 10);
										}}
									>
										Returning user
									</Button>
								</div>
							</div>
						</div>
					</SlidePanel>
					{isReturning ? (
						<SlidePanel>
							<div className="relative flex min-h-screen flex-col items-center justify-center px-[30px] pt-[120px] pb-[60px] text-center">
								<div className="absolute top-[61px] right-0 left-0 flex justify-center">
									<SvgAtt className="w-[116px]" />
								</div>
								<div className="flex min-h-[400px] flex-grow flex-col items-center justify-center pt-[20vh]">
									<h2>Welcome Back</h2>
									<p className="mt-5 px-11">
										Enter your phone number below and get ready to call the same
										play, or a new clip from college football history.
									</p>
									<div className="mt-10 flex w-full flex-grow">
										<ReturningUserForm
											onSuccess={(leadId) => {
												setReturningUserId(leadId);
												nextSlide();
											}}
										/>
									</div>
									<Button
										variant="ghost"
										size="default"
										className="mt-5 h-auto py-0 underline underline-offset-2"
										onClick={() => {
											previousSlide();
										}}
									>
										Go back
									</Button>
								</div>
							</div>
						</SlidePanel>
					) : null}
					<SlidePanel>
						<div className="relative flex min-h-screen flex-col items-center justify-center px-[30px] pt-[120px] pb-[60px] text-center">
							<div className="absolute top-[61px] right-0 left-0 flex justify-center">
								<SvgAtt className="w-[116px]" />
							</div>
							<h1 className="mb-[14px]">Choose your play</h1>
							<p className="px-5">
								Check out these legendary college football clips and hit
								continue after you've made your selection.
							</p>
							<Carousel
								opts={{
									loop: true,
								}}
								setApi={setCarouselApi}
								className="mt-10 w-full"
							>
								<CarouselContent>
									{[0, 1, 2].map((play) => (
										<CarouselItem key={play}>
											<div className="relative w-full overflow-hidden rounded-[20px] border-2 border-white">
												<div className="relative aspect-16/9 w-full overflow-hidden">
													<video
														ref={(el) => {
															videoRefs.current[play] = el;
														}}
														src={`/plays/play-${play + 1}-full.mp4`}
														loop
														playsInline
														disableRemotePlayback
														className="absolute inset-0 size-full object-cover"
													/>
												</div>
												<div className="-tracking-[0.12px] flex h-[29px] w-full items-center justify-center gap-1 bg-att-cobalt pt-1 pb-0.5 text-[12px] text-white">
													<span>Play:</span>
													<strong>
														{play === 0 ? `Ohio State vs Maryland "BBQ"` : null}
														{play === 1 ? `Florida vs LSU "Jump Pass"` : null}
														{play === 2
															? `Ohio State vs Michigan "The Hero"`
															: null}
													</strong>
												</div>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselDots />
							</Carousel>
							<div className="mt-[136px] flex flex-col items-center gap-5">
								<Button
									variant="attOutline"
									size="attOutline"
									onClick={() => {
										if (returningUserId) {
											updatePlay.mutate(
												{ id: returningUserId, play },
												{
													onSuccess: () => {
														nextSlide();
													},
												},
											);
										} else {
											nextSlide();
										}
									}}
									disabled={updatePlay.isPending}
								>
									Continue
								</Button>
							</div>
						</div>
					</SlidePanel>
					{isReturning ? null : (
						<SlidePanel>
							<div className="relative flex min-h-screen flex-col items-center justify-center px-[30px] pt-[120px] pb-[60px] text-center">
								<div className="absolute top-[61px] right-0 left-0 flex justify-center">
									<SvgAtt className="w-[116px]" />
								</div>
								<div className="flex min-h-[400px] flex-grow flex-col items-center justify-center">
									<h2>Are you at least 18 years old?</h2>
									<div className="mt-20 flex flex-col items-center gap-5">
										<Button
											variant="attOutline"
											size="attOutline"
											onClick={() => {
												setAgePassed(true);
												nextSlide();
											}}
										>
											Yes
										</Button>
										<Button
											variant="attOutline"
											size="attOutline"
											onClick={() => {
												setAgePassed(false);
												nextSlide();
											}}
										>
											No
										</Button>
									</div>
								</div>
							</div>
						</SlidePanel>
					)}
					{isReturning ? null : (
						<SlidePanel>
							<div className="relative flex min-h-screen flex-col items-center justify-center px-[30px] pt-[120px] pb-[60px] text-center">
								<div className="absolute top-[61px] right-0 left-0 flex justify-center">
									<SvgAtt className="w-[116px]" />
								</div>
								<div className="mt-10 flex min-h-[400px] flex-grow flex-col items-center justify-start">
									<div className="mt-5 flex h-full flex-grow flex-col items-center gap-4">
										<LeadForm
											agePassed={agePassed}
											play={play}
											onSuccess={() => {
												nextSlide();
											}}
										/>
									</div>
								</div>
							</div>
						</SlidePanel>
					)}
					<SlidePanel>
						<div className="relative flex min-h-screen flex-col items-center px-[30px] pt-[163px] pb-[60px] text-center">
							<div className="absolute top-[61px] right-0 left-0 flex justify-center">
								<SvgAtt className="w-[116px]" />
							</div>
							<h1 className="mb-[18px]">Ready, Break!</h1>
							<p className="px-7">
								Prepare for your moment on the mic by watching the play below.
							</p>
							<div className="mt-5 w-full">
								<div className="relative w-full overflow-hidden rounded-[20px] border-2 border-white">
									<VideoPlayer
										className="group aspect-16/9 w-full [&:fullscreen]:bg-att-blue"
										style={
											{
												"--media-control-background": "transparent",
												"--media-control-hover-background": "transparent",
											} as React.CSSProperties
										}
									>
										<VideoPlayerContent
											slot="media"
											src={`/plays/play-${play + 1}-full.mp4`}
											poster={`/plays/play-${play + 1}-poster.png`}
											loop
											playsInline
											disableRemotePlayback
											className="size-full object-cover group-[:fullscreen]:object-contain"
										/>
										<VideoPlayerPlayButton
											slot="centered-chrome"
											className="rounded-full bg-white p-4 [--media-icon-color:var(--att-blue)] group-[:not([mediapaused])]:hidden"
										/>
										<VideoPlayerControlBar className="h-7 items-center bg-white [--media-button-icon-height:16px] [--media-button-icon-width:16px] [--media-control-height:28px] [--media-icon-color:var(--att-blue)] [--media-range-bar-color:var(--att-blue)] [--media-range-thumb-background:var(--att-blue)] group-[[mediapaused]]:hidden">
											<VideoPlayerPlayButton />
											<VideoPlayerTimeRange />
											<VideoPlayerMuteButton />
											<VideoPlayerFullscreenButton />
										</VideoPlayerControlBar>
									</VideoPlayer>
									<div className="-mt-2 -tracking-[0.12px] flex h-[29px] w-full items-center justify-center gap-1 bg-att-cobalt pt-1 pb-0.5 text-[12px] text-white">
										<span>Play:</span>
										<strong>
											{play === 0 ? `Ohio State vs Maryland "BBQ"` : null}
											{play === 1 ? `Florida vs LSU "Jump Pass"` : null}
											{play === 2 ? `Ohio State vs Michigan "The Hero"` : null}
										</strong>
									</div>
								</div>
							</div>
							<p className="mt-5 px-5">
								Tap play to watch, or use fullscreen for an immersive view
							</p>
						</div>
					</SlidePanel>
				</SliderContainer>
			) : (
				<div className="flex h-full w-full flex-grow flex-col bg-att-gradient pt-10">
					<div className="absolute top-24 flex w-full justify-center">
						<SvgAtt className="w-[275px]" />
					</div>
					<div className="flex flex-grow flex-col items-center justify-center text-center">
						<h1 className="-tracking-[6px] mb-16 max-w-3xl font-bold text-[120px] uppercase italic leading-[0.88]">
							This is a mobile only experience
						</h1>
						<p className="text-[26px]">
							Please use your mobile device to scan the QR code at the
							activation to register.
						</p>
					</div>
				</div>
			)}
		</main>
	);
}

export default function HomePage() {
	return (
		<SliderProvider>
			<HomeContent />
		</SliderProvider>
	);
}
