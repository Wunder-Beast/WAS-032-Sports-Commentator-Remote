"use client";

import { useState } from "react";
import {
	SlidePanel,
	SliderContainer,
	SliderProvider,
	useFullSlider,
} from "@/components/FullSlider";
import SvgAtt from "@/components/svg/att";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadForm } from "./_components/leadForm";

function HomeContent() {
	const isMobile = useIsMobile();
	const { nextSlide } = useFullSlider();
	const [agePassed, setAgePassed] = useState(false);
	const [team, setTeam] = useState<"az" | "mi" | undefined>(undefined);

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
							<div className="-mt-[65px] flex flex-grow flex-col items-center rounded-t-[51px] bg-att-gradient px-5 pt-8 pb-5 text-center">
								<div className="mb-11">
									<SvgAtt />
								</div>
								<h1 className="-tracking-[2.2px] text-[44px] uppercase italic leading-[0.88]">
									Bold Moves
									<br />
									Big Movements
								</h1>
								<p className="mt-5 px-6 text-sm">
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
						<div className="flex min-h-screen flex-col items-center px-5 pt-10 pb-5 text-center">
							<div className="w-[180px]">
								<SvgAtt />
							</div>
							<div className="flex min-h-[400px] flex-grow flex-col items-center justify-center">
								<h2>Choose your team</h2>
								<div className="mt-20 flex items-center gap-5 px-[42px]">
									<button
										type="button"
										onClick={() => {
											setTeam("az");
											nextSlide();
										}}
									>
										<img src="/finger-az.png" alt="University of Arizona" />
									</button>
									<button
										type="button"
										onClick={() => {
											setTeam("mi");
											nextSlide();
										}}
									>
										<img src="/finger-mi.png" alt="University of Michigan" />
									</button>
								</div>
							</div>
						</div>
					</SlidePanel>
					<SlidePanel>
						<div className="flex min-h-screen flex-col items-center px-5 pt-10 pb-5 text-center">
							<div className="w-[180px]">
								<SvgAtt />
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
						<div className="flex min-h-screen flex-col items-center px-5 pt-10 pb-5 text-center">
							<div className="w-[180px]">
								<SvgAtt />
							</div>
							<div className="mt-10 flex min-h-[400px] flex-grow flex-col items-center justify-start">
								<div className="mt-5 flex h-full flex-grow flex-col items-center gap-4">
									<LeadForm
										agePassed={agePassed}
										team={team as "az" | "mi"}
										onSuccess={() => {
											console.log("succeeded, calling nextSlide");
											console.log("nextSlide function:", nextSlide);
											nextSlide();
											console.log("nextSlide called");
										}}
									/>
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
