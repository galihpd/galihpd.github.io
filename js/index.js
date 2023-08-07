document.addEventListener('DOMContentLoaded', function() {
  const hamburgerButton = document.querySelector('[aria-controls="mobile-menu"]');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburgerButton.addEventListener('click', function() {
    const isExpanded = hamburgerButton.getAttribute('aria-expanded') === 'true';

    hamburgerButton.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden', !isExpanded);
  });

  // Hide the mobile menu initially
  mobileMenu.classList.add('hidden');
});
