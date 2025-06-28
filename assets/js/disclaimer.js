// Script untuk halaman Disclaimer
document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman Disclaimer telah dimuat');
    
    // Tambahkan efek smooth scroll untuk semua anchor link
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animasi untuk header
    const header = document.querySelector('.disclaimer-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(20px)';
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
    
    // Animasi untuk section content
    const sections = document.querySelectorAll('.disclaimer-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
    
    // Highlight box hover effect
    const highlightBoxes = document.querySelectorAll('.highlight-box');
    highlightBoxes.forEach(box => {
        box.addEventListener('mouseenter', () => {
            box.style.transform = 'translateX(5px)';
            box.style.boxShadow = 'var(--shadow-lg)';
            box.style.transition = 'all 0.3s ease';
        });
        
        box.addEventListener('mouseleave', () => {
            box.style.transform = 'translateX(0)';
            box.style.boxShadow = 'none';
        });
    });
});