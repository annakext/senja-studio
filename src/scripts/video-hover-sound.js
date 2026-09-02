export function initHoverSoundVideos(root) {
	const scope = root || document;
	const wrappers = scope.querySelectorAll('.video-hover-sound');
	wrappers.forEach((wrapper) => {
		if (wrapper.dataset.hoverSoundInit === '1') return;
		wrapper.dataset.hoverSoundInit = '1';

		const video = wrapper.querySelector('video');
		if (!video) return;

		const soundBtn = wrapper.querySelector('.sound-toggle');
		if (soundBtn) {
			const iconOn = soundBtn.querySelector('.icon-on');
			const iconOff = soundBtn.querySelector('.icon-off');

			const updateSoundIcon = () => {
				if (iconOn) iconOn.classList.toggle('hidden', video.muted);
				if (iconOff) iconOff.classList.toggle('hidden', !video.muted);
			};
			updateSoundIcon();

			soundBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				video.muted = !video.muted;
				if (!video.muted) {
					const p = video.play();
					if (p && p.catch) p.catch(() => {});
				}
				updateSoundIcon();
			});
		}

		const playBtn = wrapper.querySelector('.play-toggle');
		if (playBtn) {
			const iconPlaying = playBtn.querySelector('.icon-playing');
			const iconPaused = playBtn.querySelector('.icon-paused');

			const updatePlayIcon = () => {
				if (iconPlaying) iconPlaying.classList.toggle('hidden', video.paused);
				if (iconPaused) iconPaused.classList.toggle('hidden', !video.paused);
			};
			updatePlayIcon();
			video.addEventListener('play', updatePlayIcon);
			video.addEventListener('pause', updatePlayIcon);

			playBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				if (video.paused) {
					const p = video.play();
					if (p && p.catch) p.catch(() => {});
				} else {
					video.pause();
				}
			});
		}
	});
}
