/** biome-ignore-all lint/a11y/useSemanticElements: shadcn */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: not needed */
"use client";

import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
	opts?: CarouselOptions;
	plugins?: CarouselPlugin;
	orientation?: "horizontal" | "vertical";
	setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0];
	api: ReturnType<typeof useEmblaCarousel>[1];
	scrollPrev: () => void;
	scrollNext: () => void;
	scrollTo: (index: number) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	selectedIndex: number;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

const Carousel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(
	(
		{
			orientation = "horizontal",
			opts,
			setApi,
			plugins,
			className,
			children,
			...props
		},
		ref,
	) => {
		const [carouselRef, api] = useEmblaCarousel(
			{
				...opts,
				axis: orientation === "horizontal" ? "x" : "y",
			},
			plugins,
		);
		const [canScrollPrev, setCanScrollPrev] = React.useState(false);
		const [canScrollNext, setCanScrollNext] = React.useState(false);
		const [selectedIndex, setSelectedIndex] = React.useState(
			opts?.startIndex || 0,
		);

		const onSelect = React.useCallback((api: CarouselApi) => {
			if (!api) {
				return;
			}

			setCanScrollPrev(api.canScrollPrev());
			setCanScrollNext(api.canScrollNext());
			setSelectedIndex(api.selectedScrollSnap());
		}, []);

		const scrollPrev = React.useCallback(() => {
			api?.scrollPrev();
		}, [api]);

		const scrollNext = React.useCallback(() => {
			api?.scrollNext();
		}, [api]);

		const scrollTo = React.useCallback(
			(index: number) => {
				if (index === api?.selectedScrollSnap()) return;
				const autoplay = api?.plugins()?.autoplay as
					| { reset: () => void }
					| undefined;
				autoplay?.reset();
				api?.scrollTo(index);
			},
			[api],
		);

		const handleKeyDown = React.useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (event.key === "ArrowLeft") {
					event.preventDefault();
					scrollPrev();
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					scrollNext();
				}
			},
			[scrollPrev, scrollNext],
		);

		React.useEffect(() => {
			if (!api || !setApi) {
				return;
			}

			setApi(api);
		}, [api, setApi]);

		React.useEffect(() => {
			if (!api) {
				return;
			}

			onSelect(api);
			api.on("reInit", onSelect);
			api.on("select", onSelect);

			return () => {
				api?.off("select", onSelect);
			};
		}, [api, onSelect]);

		return (
			<CarouselContext.Provider
				value={{
					carouselRef,
					api: api,
					opts,
					orientation:
						orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
					scrollPrev,
					scrollNext,
					scrollTo,
					canScrollPrev,
					canScrollNext,
					selectedIndex,
				}}
			>
				<div
					ref={ref}
					onKeyDownCapture={handleKeyDown}
					className={cn("relative", className)}
					role="region"
					aria-roledescription="carousel"
					{...props}
				>
					{children}
				</div>
			</CarouselContext.Provider>
		);
	},
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div ref={carouselRef} className="overflow-hidden">
			<div
				ref={ref}
				className={cn(
					"flex",
					orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
					className,
				)}
				{...props}
			/>
		</div>
	);
});
CarouselContent.displayName = "CarouselContent";

/**
 * CarouselDots by @plettj, 2025-04-30
 *
 * Currently only works with horizontal orientation.
 */
function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
	const { selectedIndex, scrollTo, api } = useCarousel();

	return (
		<div
			role="tablist"
			className={cn(
				"-bottom-[76px] absolute flex w-full items-center justify-center gap-5",
				className,
			)}
			{...props}
		>
			{api?.scrollSnapList().map((_, index) => (
				<button
					key={`carousel-dot-${index}`}
					role="tab"
					type="button"
					data-slot="carousel-dot"
					aria-selected={index === selectedIndex}
					aria-controls="carousel-item"
					aria-label={`Slide ${index + 1}`}
					className={cn(
						"flex size-[51px] cursor-pointer items-center justify-center rounded-full border-3 border-white pl-0.5 font-black font-headline text-[32px] leading-[1.1]",
						index === selectedIndex
							? "bg-att-cobalt text-white"
							: "bg-transparent",
					)}
					onClick={() => scrollTo(index)}
				>
					{index + 1}
				</button>
			))}
		</div>
	);
}

const CarouselItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { orientation } = useCarousel();

	return (
		<div
			ref={ref}
			role="group"
			aria-roledescription="slide"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				orientation === "horizontal" ? "pl-4" : "pt-4",
				className,
			)}
			{...props}
		/>
	);
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel();

	return (
		<Button
			ref={ref}
			variant={variant}
			size={size}
			className={cn(
				"absolute h-8 w-8 rounded-full",
				orientation === "horizontal"
					? "-left-12 -translate-y-1/2 top-1/2"
					: "-top-12 -translate-x-1/2 left-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			{...props}
		>
			<ArrowLeft className="h-4 w-4" />
			<span className="sr-only">Previous slide</span>
		</Button>
	);
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollNext, canScrollNext } = useCarousel();

	return (
		<Button
			ref={ref}
			variant={variant}
			size={size}
			className={cn(
				"absolute h-8 w-8 rounded-full",
				orientation === "horizontal"
					? "-right-12 -translate-y-1/2 top-1/2"
					: "-bottom-12 -translate-x-1/2 left-1/2 rotate-90",
				className,
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			{...props}
		>
			<ArrowRight className="h-4 w-4" />
			<span className="sr-only">Next slide</span>
		</Button>
	);
});
CarouselNext.displayName = "CarouselNext";

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselDots,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
};
