export function initResponsiveLogo() {
	const logo = document.getElementById('site-logo');
	if (!logo) return;

	const baseFontSize = 41;
	const breakpoint = 768;
	const leftMargin = 24;
	const naturalWidth = logo.getBoundingClientRect().width;

	const apply = () => {
		if (window.innerWidth >= breakpoint) {
			logo.style.fontSize = '';
			return;
		}
		const targetWidth = window.innerWidth / 2 - leftMargin;
		const scale = targetWidth / naturalWidth;
		logo.style.fontSize = (baseFontSize * scale) + 'px';
	};

	apply();
	window.addEventListener('resize', apply);
}
