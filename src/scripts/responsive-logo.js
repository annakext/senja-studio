export function initResponsiveLogo(leftMargin = 24, mobileReduction = 1) {
	const logo = document.getElementById('site-logo');
	if (!logo) return;

	const baseFontSize = 41;
	const breakpoint = 768;

	const measureNaturalWidth = () => {
		const prevFontSize = logo.style.fontSize;
		logo.style.fontSize = '';
		const width = logo.getBoundingClientRect().width;
		logo.style.fontSize = prevFontSize;
		return width;
	};

	const apply = () => {
		if (window.innerWidth >= breakpoint) {
			logo.style.fontSize = '';
			return;
		}
		const naturalWidth = measureNaturalWidth();
		if (!naturalWidth) return;
		const targetWidth = (window.innerWidth / 2 - leftMargin) * mobileReduction;
		const scale = targetWidth / naturalWidth;
		logo.style.fontSize = (baseFontSize * scale) + 'px';
	};

	apply();
	window.addEventListener('resize', apply);
	window.addEventListener('load', apply);
	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(apply);
	}
}
