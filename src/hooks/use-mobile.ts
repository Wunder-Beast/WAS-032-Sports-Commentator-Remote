import * as React from "react";

const MOBILE_BREAKPOINT = 1025;

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
		undefined,
	);

	React.useEffect(() => {
		// Lock mobile detection on first load - don't change based on orientation
		const initialIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
		setIsMobile(initialIsMobile);
	}, []);

	return !!isMobile;
}

export function useIsLandscape() {
	const [isLandscape, setIsLandscape] = React.useState(false);

	React.useEffect(() => {
		const checkOrientation = () => {
			setIsLandscape(window.innerWidth > window.innerHeight);
		};

		checkOrientation();
		window.addEventListener("resize", checkOrientation);
		return () => window.removeEventListener("resize", checkOrientation);
	}, []);

	return isLandscape;
}
