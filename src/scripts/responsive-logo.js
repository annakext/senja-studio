export function initResponsiveLogo(leftMargin = 24) {
	const logo = document.getElementById('site-logo');
	if (!logo) return;

	const baseFontSize = 41;
	const breakpoint = 768;
	const mobileReduction = 0.85;
	const naturalWidth = logo.getBoundingClientRect().width;

	const apply = () => {
		if (window.innerWidth >= breakpoint) {
			logo.style.fontSize = '';
			return;
		}
		const targetWidth = (window.innerWidth / 2 - leftMargin) * mobileReduction;
		const scale = targetWidth / naturalWidth;
		logo.style.fontSize = (baseFontSize * scale) + 'px';
	};

	apply();
	window.addEventListener('resize', apply);
	window.addEventListener('load', apply);
}
