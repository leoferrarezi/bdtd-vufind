function applyGrayscale() {
    document.body.classList.toggle('grayscale');
    localStorage.setItem('grayscale', document.body.classList.contains('grayscale'));
}

function applyHighContrast() {
    document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
}

function applyNegativeContrast() {
    document.body.classList.toggle('negative-contrast');
    localStorage.setItem('negativeContrast', document.body.classList.contains('negative-contrast'));
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('grayscale') === 'true') {
        document.body.classList.add('grayscale');
    }
    if (localStorage.getItem('highContrast') === 'true') {
        document.body.classList.add('high-contrast');
    }
    if (localStorage.getItem('negativeContrast') === 'true') {
        document.body.classList.add('negative-contrast');
    }
});

