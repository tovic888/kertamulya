// Script untuk Kebijakan Privasi
document.addEventListener('DOMContentLoaded', function() {
    console.log('Kebijakan Privasi page loaded');
    
    // Tambahkan event listener untuk smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Tambahkan tahun dinamis di footer
    const yearElement = document.querySelector('.copyright');
    if (yearElement) {
        const currentYear = new Date().getFullYear();
        yearElement.innerHTML = yearElement.innerHTML.replace('2025', currentYear);
    }
    
    // Animasi untuk highlight box
    const highlightBoxes = document.querySelectorAll('.highlight-box');
    highlightBoxes.forEach(box => {
        box.addEventListener('mouseenter', () => {
            box.style.transform = 'translateX(5px)';
            box.style.transition = 'transform 0.3s ease';
        });
        
        box.addEventListener('mouseleave', () => {
            box.style.transform = 'translateX(0)';
        });
    });
});