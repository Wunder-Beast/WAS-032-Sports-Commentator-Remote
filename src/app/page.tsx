"use client";

import { useEffect, useState } from "react";
import {
	SlidePanel,
	SliderContainer,
	SliderProvider,
	useFullSlider,
} from "@/components/FullSlider";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
} from "@/components/ui/carousel";
import { LeadForm } from "./_components/leadForm";

function HomeContent() {
	// const { nextSlide, previousSlide, goToSlide, currentSlide } = useFullSlider();
	const { nextSlide, previousSlide } = useFullSlider();
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [selectedDesignIndex, setSelectedDesignIndex] = useState(0);
	const [agePassed, setAgePassed] = useState(false);

	useEffect(() => {
		if (!carouselApi) return;

		const onSelect = () => {
			setSelectedDesignIndex(carouselApi.selectedScrollSnap());
		};

		carouselApi.on("select", onSelect);
		return () => {
			carouselApi.off("select", onSelect);
		};
	}, [carouselApi]);

	return (
		<main className="att relative flex min-h-screen flex-col justify-center">
			<div className="absolute top-[30px] right-0 left-0 flex items-center justify-center">
				<img src="/logo-branded.png" alt="AT&T Logo" width={150} />
			</div>
			{/* Slide 0: Select the play */}
			<SliderContainer className="min-h-screen">
				<SlidePanel>
					<div className="flex min-h-screen flex-col items-center justify-center px-[40px] pt-[120px] pb-[60px] text-center">
						<h1 className="mb-5">Welcome</h1>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
							urna nisi, aliquam nec libero eget, condimentum.
						</p>
						<div className="mt-18 flex flex-col items-center gap-3">
							<Button variant="attCobalt" size="fixed" onClick={nextSlide}>
								New user
							</Button>
							<Button variant="attCobalt" size="fixed" onClick={previousSlide}>
								Returning user
							</Button>
						</div>
					</div>
				</SlidePanel>
				<SlidePanel>
					<div className="flex min-h-screen flex-col items-center justify-center px-[40px] pt-[120px] pb-[60px] text-center">
						<h1 className="mb-2">Choose your play</h1>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
							urna nisi, aliquam nec libero eget, condimentum.
						</p>
						<Carousel
							opts={{
								loop: true,
							}}
							setApi={setCarouselApi}
							className="mt-8 w-full"
						>
							<CarouselContent>
								{[0, 1, 2, 3].map((designIndex) => (
									<CarouselItem key={designIndex}>
										<div className="relative aspect-16/9 w-full overflow-hidden rounded-[20px] border-2 border-white">
											<img
												src={`/plays/play-${designIndex}.png`}
												alt={`Play ${designIndex}`}
												className="absolute inset-0 size-full object-cover"
											/>
											<div className="absolute right-0 bottom-0 left-0 flex h-[40px] items-center justify-center gap-1 bg-att-cobalt text-white">
												<span>Play:</span>
												<strong>
													{designIndex === 0 ? "Play 1" : null}
													{designIndex === 1 ? "Play 2" : null}
													{designIndex === 2 ? "Play 3" : null}
													{designIndex === 3 ? "Play 4" : null}
												</strong>
											</div>
										</div>
									</CarouselItem>
								))}
							</CarouselContent>
							<CarouselDots />
						</Carousel>
						<div className="mt-40 flex flex-col items-center gap-5">
							<Button variant="attCobalt" size="fixed" onClick={nextSlide}>
								Continue
							</Button>
						</div>
					</div>
				</SlidePanel>
				<SlidePanel>
					<div className="flex min-h-screen flex-col items-center justify-center px-[40px] pt-[120px] pb-[60px] text-center">
						<h1>
							Are you at least
							<br />
							18 years old?
						</h1>
						<div className="mt-18 flex flex-col items-center gap-3">
							<Button
								variant="attCobalt"
								size="fixed"
								onClick={() => {
									setAgePassed(true);
									nextSlide();
								}}
							>
								Yes
							</Button>
							<Button
								variant="attCobalt"
								size="fixed"
								onClick={() => {
									setAgePassed(false);
									nextSlide();
								}}
							>
								No
							</Button>
						</div>
					</div>
				</SlidePanel>
				<SlidePanel>
					<div className="flex min-h-screen flex-col items-center justify-center px-[40px] pt-[120px] pb-[60px] text-center">
						<LeadForm agePassed={agePassed} play={selectedDesignIndex + 1} />
					</div>
				</SlidePanel>
				<SlidePanel>
					<div className="flex min-h-screen flex-col items-center justify-center px-[40px] pt-[120px] pb-[60px] text-center">
						<h1 className="mb-2">Choose your play</h1>
						<div className="relative aspect-16/9 w-full overflow-hidden rounded-[20px] border-2 border-white">
							<img
								src={`/plays/play-${selectedDesignIndex}.png`}
								alt={`Play ${selectedDesignIndex + 1}`}
								className="absolute inset-0 size-full object-cover"
							/>
							<div className="absolute right-0 bottom-0 left-0 flex h-[40px] items-center justify-center gap-1 bg-att-cobalt text-white">
								<span>Play:</span>
								<strong>
									{selectedDesignIndex === 0 ? "Play 1" : null}
									{selectedDesignIndex === 1 ? "Play 2" : null}
									{selectedDesignIndex === 2 ? "Play 3" : null}
									{selectedDesignIndex === 3 ? "Play 4" : null}
								</strong>
							</div>
						</div>
						<div className="mt-40 flex flex-col items-center gap-5">
							<Button variant="attCobalt" size="fixed" onClick={nextSlide}>
								Continue
							</Button>
						</div>
					</div>
				</SlidePanel>
			</SliderContainer>
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
