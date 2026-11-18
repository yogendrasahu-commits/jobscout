/**
 * Updates CSS custom properties --mouse-x and --mouse-y
 * for linear-style dynamic cursor-tracking border spotlight illumination.
 */
export const handleSpotlightMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
};
