(function () {
	'use strict';

	// Mobile nav toggle
	var toggle = document.querySelector('.nav-toggle');
	var nav    = document.querySelector('.primary-nav');

	if (toggle && nav) {
		toggle.addEventListener('click', function () {
			var isOpen = nav.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
			document.body.style.overflow = isOpen ? 'hidden' : '';
		});

		// Close on outside click
		document.addEventListener('click', function (e) {
			if (nav.classList.contains('is-open') &&
				!nav.contains(e.target) &&
				!toggle.contains(e.target)) {
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
			}
		});

		// Close on Escape
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && nav.classList.contains('is-open')) {
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
				document.body.style.overflow = '';
				toggle.focus();
			}
		});
	}

	// Sticky header shadow on scroll
	var header = document.querySelector('.site-header');
	if (header) {
		window.addEventListener('scroll', function () {
			header.classList.toggle('is-scrolled', window.scrollY > 8);
		}, { passive: true });
	}
})();
