"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

interface FullSliderContextType {
	currentSlide: number;
	nextSlide: () => void;
	previousSlide: () => void;
	goToSlide: (index: number) => void;
	totalSlides: number;
	setTotalSlides: (count: number) => void;
	getSlidePosition: (index: number) => number;
	hydrated: boolean;
}

const FullSliderContext = createContext<FullSliderContextType | undefined>(
	undefined,
);

export const useFullSlider = () => {
	const context = useContext(FullSliderContext);
	if (!context) {
		throw new Error(
			"useFullSlider must be used within a SliderProvider or FullSlider.Root",
		);
	}
	return context;
};

interface SliderProviderProps {
	children: ReactNode;
	defaultSlide?: number;
	onSlideChange?: (index: number) => void;
	scrollToTop?: boolean;
	scrollDelay?: number;
	getSlidePosition?: (slideIndex: number) => number;
}

export function SliderProvider({
	children,
	defaultSlide = 0,
	onSlideChange,
	scrollToTop = true,
	scrollDelay = 450,
	getSlidePosition: customGetSlidePosition,
}: SliderProviderProps) {
	const [currentSlide, setCurrentSlide] = useState(defaultSlide);
	const [totalSlides, setTotalSlides] = useState(Number.MAX_SAFE_INTEGER);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		setHydrated(true);
	}, []);

	const defaultGetSlidePosition = (slideIndex: number): number => {
		return slideIndex * 100;
	};

	const getSlidePosition = customGetSlidePosition || defaultGetSlidePosition;

	const handleSlideChange = useCallback(
		(newSlide: number) => {
			if (newSlide < 0 || newSlide >= totalSlides) return;

			setCurrentSlide(newSlide);
			onSlideChange?.(newSlide);

			if (scrollToTop) {
				setTimeout(() => {
					window.scrollTo(0, 0);
				}, scrollDelay);
			}
		},
		[totalSlides, onSlideChange, scrollToTop, scrollDelay],
	);

	const value = useMemo<FullSliderContextType>(
		() => ({
			currentSlide,
			totalSlides,
			setTotalSlides,
			getSlidePosition,
			hydrated,
			nextSlide: () => handleSlideChange(currentSlide + 1),
			previousSlide: () => handleSlideChange(currentSlide - 1),
			goToSlide: (index: number) => handleSlideChange(index),
		}),
		[currentSlide, totalSlides, getSlidePosition, handleSlideChange, hydrated],
	);

	return (
		<FullSliderContext.Provider value={value}>
			{children}
		</FullSliderContext.Provider>
	);
}

interface SliderContainerProps {
	children: ReactNode;
	className?: string;
}

export function SliderContainer({
	children,
	className = "",
}: SliderContainerProps) {
	const { currentSlide, setTotalSlides, getSlidePosition } = useFullSlider();

	const childrenArray = Array.isArray(children)
		? children.filter(Boolean)
		: [children].filter(Boolean);

	// Update total slides when children change
	useEffect(() => {
		setTotalSlides(childrenArray.length);
	}, [childrenArray.length, setTotalSlides]);

	return (
		<div className={`flex flex-grow flex-col overflow-hidden ${className}`}>
			<div
				className="flex flex-grow transition-transform duration-500 ease-in-out"
				style={{
					transform: `translateX(-${getSlidePosition(currentSlide)}%)`,
				}}
			>
				{childrenArray}
			</div>
		</div>
	);
}

interface SlidePanelProps {
	children: ReactNode;
	className?: string;
}

export function SlidePanel({ children, className = "" }: SlidePanelProps) {
	return (
		<div className={`w-full flex-shrink-0 flex-grow ${className}`}>
			{children}
		</div>
	);
}

interface SlideSpacer {
	width?: string;
}

export function SlideSpacer({ width = "50%" }: SlideSpacer) {
	return <div className="flex-shrink-0" style={{ width }} />;
}
