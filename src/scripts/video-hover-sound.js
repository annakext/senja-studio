// Browsers only allow audible autoplay after a real user gesture (click,
// keydown, touchstart) — hovering never counts. So the very first hover on a
// freshly loaded page can end up silently stuck muted even though we set
// video.muted = false. The page's first real click establishes that gesture
// for the rest of the page's life, so we retry the unmute for whichever
// video is currently hovered at that moment, and every hover after that
// works normally on its own.
const currentlyHovered = new Set();
document.addEventListener(
	'click',
	() => {
		currentlyHovered.forEach((retry) => retry());
	},
	{ capture: true }
);

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

		// Tracks whether we're currently trying to play this video with sound
		// because the user is hovering it (as opposed to it just being paused
		// for an unrelated reason).
		let hoverIntentUnmuted = false;

		const updateIcon = () => {
			if (iconOn) iconOn.classList.toggle('hidden', video.muted);
			if (iconOff) iconOff.classList.toggle('hidden', !video.muted);
		};
		updateIcon();

		const attemptUnmute = () => {
			hoverIntentUnmuted = true;
			video.muted = false;
			updateIcon();
			const playPromise = video.play();
			if (playPromise && playPromise.catch) {
				playPromise.catch(() => {
					// Autoplay-with-sound rejected outright: fall back to muted,
					// no visible error.
					hoverIntentUnmuted = false;
					video.muted = true;
					updateIcon();
				});
			}
		};

		wrapper.addEventListener('mouseenter', () => {
			currentlyHovered.add(attemptUnmute);
			attemptUnmute();
		});

		wrapper.addEventListener('mouseleave', () => {
			currentlyHovered.delete(attemptUnmute);
			hoverIntentUnmuted = false;
			video.muted = true;
			updateIcon();
		});

		// Some browsers silently pause an already-playing video the moment a
		// script unmutes it without a qualifying user gesture (hover doesn't
		// count as one). Catch that here and fall back to a muted loop instead
		// of leaving a frozen frame.
		video.addEventListener('pause', () => {
			if (!hoverIntentUnmuted) return;
			video.muted = true;
			updateIcon();
			const p = video.play();
			if (p && p.catch) p.catch(() => {});
		});

		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			video.muted = !video.muted;
			hoverIntentUnmuted = !video.muted;
			updateIcon();
		});
	});
}
