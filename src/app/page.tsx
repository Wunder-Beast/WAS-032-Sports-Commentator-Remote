"use client";

import {
	SlidePanel,
	SliderContainer,
	SliderProvider,
	useFullSlider,
} from "@/components/FullSlider";
import { Button } from "@/components/ui/button";

function HomeContent() {
	// const { nextSlide, previousSlide, goToSlide, currentSlide } = useFullSlider();
	const { nextSlide, previousSlide } = useFullSlider();

	return (
		<main className="att relative flex min-h-screen flex-col justify-center">
			<div className="absolute top-[30px] right-0 left-0 flex items-center justify-center">
				<img src="/logo-branded.png" alt="AT&T Logo" width={150} />
			</div>
			{/* Slide 0: Select the play */}
			<SliderContainer className="min-h-screen">
				<SlidePanel>
					<div className="flex min-h-screen flex-col px-[40px] pt-[220px] pb-[60px] text-center">
						<h1 className="mb-5">Welcome</h1>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
							urna nisi, aliquam nec libero eget, condimentum.
						</p>
						<div className="mt-16 flex flex-col items-center gap-5">
							<Button variant="attCobalt" size="fixed" onClick={nextSlide}>
								New user
							</Button>
							<Button variant="attCobalt" size="fixed" onClick={previousSlide}>
								Returning user
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
