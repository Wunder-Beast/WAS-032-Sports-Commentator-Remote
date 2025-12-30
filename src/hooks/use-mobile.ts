import * as React from "react";

export function useIsMobile() {
	const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
		undefined,
	);

	React.useEffect(() => {
		// Check for touch capability
		const hasTouchScreen =
			"ontouchstart" in window || navigator.maxTouchPoints > 0;
		setIsMobile(hasTouchScreen);
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
