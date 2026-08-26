export function initHoverSoundVideos(root) {
	const scope = root || document;
	const wrappers = scope.querySelectorAll('.video-hover-sound');
	wrappers.forEach((wrapper) => {
		if (wrapper.dataset.hoverSoundInit === '1') return;
		wrapper.dataset.hoverSoundInit = '1';

		const video = wrapper.querySelector('video');
		const btn = wrapper.querySelector('.sound-toggle');
		if (!video || !btn) return;
		const iconOn = btn.querySelector('.icon-on');
		const iconOff = btn.querySelector('.icon-off');

		const updateIcon = () => {
			if (iconOn) iconOn.classList.toggle('hidden', video.muted);
			if (iconOff) iconOff.classList.toggle('hidden', !video.muted);
		};
		updateIcon();

		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			video.muted = !video.muted;
			if (!video.muted) {
				const p = video.play();
				if (p && p.catch) p.catch(() => {});
			}
			updateIcon();
		});
	});
}
