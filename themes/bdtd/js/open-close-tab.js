document.addEventListener('DOMContentLoaded', async () => {
  const openClose = document.querySelector('[data-open-close]');
  openClose.addEventListener('click', () => {
    const contentElement = document.querySelector('.tab-pane');
    contentElement.classList.toggle('active');
  });
});
