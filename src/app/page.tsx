"use client";

import { useEffect, useState } from "react";
import {
	SlidePanel,
	SliderContainer,
	SliderProvider,
	useFullSlider,
} from "@/components/FullSlider";
import SvgAtt from "@/components/svg/att";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	type CarouselApi,
	CarouselContent,
	CarouselDots,
	CarouselItem,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadForm } from "./_components/leadForm";

function HomeContent() {
	const isMobile = useIsMobile();
	const { nextSlide } = useFullSlider();
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [agePassed, setAgePassed] = useState(false);
	const [play, setPlay] = useState(0);

	useEffect(() => {
		if (!carouselApi) return;

		const onSelect = () => {
			setPlay(carouselApi.selectedScrollSnap());
		};

		carouselApi.on("select", onSelect);
		return () => {
			carouselApi.off("select", onSelect);
		};
	}, [carouselApi]);

	return (
		<main className="att relative flex min-h-dvh flex-col justify-center">
			{isMobile ? (
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
									Bold Moves
									<br />
									Big Movements
								</h1>
								<p className="mt-5 px-11">
									Step into the broadcast booth and call the play by play for
									college football's biggest moments
								</p>
								<div className="my-11 flex flex-col gap-5">
									<Button
										variant="attOutline"
										size="attOutline"
										onClick={() => {
											nextSlide();
										}}
									>
										New user
									</Button>
									<Button
										variant="attOutline"
										size="attOutline"
										onClick={() => {
											nextSlide();
										}}
									>
										Returning user
									</Button>
								</div>
							</div>
						</div>
					</SlidePanel>
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
											<div className="relative aspect-16/9 w-full overflow-hidden rounded-[20px] border-2 border-white">
												<img
													src={`/plays/play-${play}.png`}
													alt={`Play ${play}`}
													className="absolute inset-0 size-full object-cover"
												/>
												<div className="-tracking-[0.12px] absolute right-0 bottom-0 left-0 flex h-[28px] items-center justify-center gap-1 bg-att-cobalt pt-1 text-[12px] text-white">
													<span>Play:</span>
													<strong>
														{play === 0 ? "Play 1" : null}
														{play === 1 ? "Play 2" : null}
														{play === 2 ? "Play 3" : null}
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
									onClick={nextSlide}
								>
									Continue
								</Button>
							</div>
						</div>
					</SlidePanel>
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
					<SlidePanel>
						<div className="relative flex min-h-screen flex-col items-center px-[30px] pt-[163px] pb-[60px] text-center">
							<div className="absolute top-[61px] right-0 left-0 flex justify-center">
								<SvgAtt className="w-[116px]" />
							</div>
							<h1 className="mb-[14px]">Ready, Break!</h1>
							<p className="px-7">
								Prepare for your moment on the mic by watching the play below.
							</p>
							<div className="mt-10 w-full">
								<div className="relative aspect-16/9 w-full overflow-hidden rounded-[20px] border-2 border-white">
									<img
										src={`/plays/play-${play}.png`}
										alt={`Play ${play}`}
										className="absolute inset-0 size-full object-cover"
									/>
									<div className="-tracking-[0.12px] absolute right-0 bottom-0 left-0 flex h-[28px] items-center justify-center gap-1 bg-att-cobalt pt-1 text-[12px] text-white">
										<span>Play:</span>
										<strong>
											{play === 0 ? "Play 1" : null}
											{play === 1 ? "Play 2" : null}
											{play === 2 ? "Play 3" : null}
										</strong>
									</div>
								</div>
							</div>
						</div>
					</SlidePanel>
				</SliderContainer>
			) : (
				<div
					className="flex h-full w-full flex-grow flex-col bg-center bg-cover pt-10"
					style={{ backgroundImage: "url('/desktop.jpg')" }}
				>
					<div className="absolute top-24 flex w-full justify-center">
						<SvgAtt />
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
