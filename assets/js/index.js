/**
 * Kertamulya Residence - Complete Main JavaScript File
 * 100% Full and Complete Implementation
 */

document.addEventListener('DOMContentLoaded', function() {
  // ========== GLOBAL VARIABLES ==========
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const urgencyBanner = document.querySelector('.urgency-banner');
  const header = document.querySelector('.main-header');
  const typeTabBtns = document.querySelectorAll('.type-tab-btn');
  const typeCards = document.querySelectorAll('.type-card');
  const btnVideoPreviews = document.querySelectorAll('.btn-video-preview');
  const btnGallery = document.querySelectorAll('.btn-gallery');
  const btnPlayTestimonial = document.querySelectorAll('.btn-play-testimonial');
  const faqQuestions = document.querySelectorAll('.faq-question');
  const bookingForm = document.getElementById('bookingForm');
  const galleryModal = document.querySelector('.gallery-modal');
  const galleryModalClose = document.querySelector('.gallery-modal-close');
  const videoModal = document.querySelector('.video-modal');
  const videoModalClose = document.querySelector('.video-modal-close');
  const videoIframe = document.getElementById('video-iframe');
  const statNumbers = document.querySelectorAll('.stat-number');
  const countdownItems = document.querySelectorAll('.countdown-item span:first-child');
  const soldCount = document.querySelector('.sold-count');
  const themeToggle = document.getElementById('themeToggle') || document.querySelector('.theme-toggle');
  const body = document.body;

  // ========== DARK MODE FUNCTIONALITY ==========
  function initDarkMode() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const icon = themeToggle.querySelector('i');

  // Check for saved user preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply the initial theme
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    html.setAttribute('data-theme', 'dark');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    html.removeAttribute('data-theme');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    if (html.getAttribute('data-theme') === 'dark') {
      html.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
    }
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        html.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
      } else {
        html.removeAttribute('data-theme');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  });
}
  // ========== MOBILE MENU ==========
  function initMobileMenu() {
    if (!mobileMenuToggle || !mobileMenu) return;

    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-menu a').forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ========== URGENCY BANNER (Modified to 1-day countdown) ==========
  function initUrgencyBanner() {
    if (!urgencyBanner) return;

    // Set 1-day countdown from first visit
    let targetTime = localStorage.getItem('countdownTarget');
    const ipKey = 'user_ip_' + (window.userIP || 'default');
    
    if (!targetTime) {
      const now = new Date();
      now.setDate(now.getDate() + 1); // Changed from 3 days to 1 day
      targetTime = now.getTime();
      localStorage.setItem('countdownTarget', targetTime);
      localStorage.setItem(ipKey, 'registered');
    } else {
      targetTime = parseInt(targetTime);
    }

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetTime - now;
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      if (countdownItems.length >= 4) {
        countdownItems[0].textContent = days.toString().padStart(2, '0');
        countdownItems[1].textContent = hours.toString().padStart(2, '0');
        countdownItems[2].textContent = minutes.toString().padStart(2, '0');
        countdownItems[3].textContent = seconds.toString().padStart(2, '0');
      }
      
      if (distance < 0) {
        clearInterval(countdownTimer);
        if (urgencyBanner.querySelector('.countdown')) {
          urgencyBanner.querySelector('.countdown').innerHTML = '<span>Promo telah berakhir!</span>';
        }
      }
    }
    
    updateCountdown();
    const countdownTimer = setInterval(updateCountdown, 1000);
    
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > lastScroll && currentScroll > 100) {
        urgencyBanner.style.transform = 'translateY(-100%)';
        if (header) header.style.top = '0';
      } else if (currentScroll < 300) {
        urgencyBanner.style.transform = 'translateY(0)';
        if (header) header.style.top = urgencyBanner.offsetHeight + 'px';
      }
      lastScroll = currentScroll;
    });
  }

  // ========== ANIMATED COUNTERS ==========
  function initAnimatedCounters() {
    if (!statNumbers.length) return;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.textContent);
      const increment = target / 100;
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          stat.textContent = Math.floor(current) + '+';
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = target + '+';
        }
      };
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateCounter();
          observer.unobserve(stat);
        }
      }, { threshold: 0.5 });
      
      observer.observe(stat);
    });

    if (soldCount) {
      let count = 0;
      const target = 120;
      const duration = 3000;
      const increment = target / (duration / 16);
      
      const updateSoldCount = () => {
        count += increment;
        if (count < target) {
          soldCount.textContent = Math.floor(count) + '+';
          requestAnimationFrame(updateSoldCount);
        } else {
          soldCount.textContent = target + '+';
        }
      };
      
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          updateSoldCount();
          observer.unobserve(soldCount);
        }
      });
      
      observer.observe(soldCount);
    }
  }

  // ========== HOUSE TYPE TABS ==========
  function initHouseTypeTabs() {
    if (!typeTabBtns.length || !typeCards.length) return;

    typeTabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        typeTabBtns.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const type = this.dataset.type;
        
        typeCards.forEach(card => {
          card.style.display = (type === 'all' || card.dataset.type === type) ? 'block' : 'none';
        });
      });
    });
  }

  // ========== VIDEO PREVIEW ==========
  function initVideoPreviews() {
    if (!btnVideoPreviews.length || !videoModal || !videoIframe) return;

    btnVideoPreviews.forEach(btn => {
      btn.addEventListener('click', function() {
        const videoId = this.dataset.videoId;
        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ========== GALLERY MODAL ==========
  function initGalleryModal() {
    if (!btnGallery.length || !galleryModal) return;

    const galleries = {
      standard: [
        { src: 'assets/img/tipe-rumah/standart/standar-utama.webp', alt: 'Standard Mezzanine 30/60 - Tampak Depan' },
        { src: 'assets/img/tipe-rumah/standart/std1.webp', alt: 'Standard Mezzanine 30/60 - Tampak Samping' },
        { src: 'assets/img/tipe-rumah/standart/std2.webp', alt: 'Standard Mezzanine 30/60 - Ruang Tamu' },
        { src: 'assets/img/tipe-rumah/standart/std3.webp', alt: 'Standard Mezzanine 30/60 - Kamar Tidur' },
        { src: 'assets/img/tipe-rumah/standart/std4.webp', alt: 'Standard Mezzanine 30/60 - Dapur' },
        { src: 'assets/img/tipe-rumah/standart/std5.webp', alt: 'Standard Mezzanine 30/60 - Kamar Mandi' },
        { src: 'assets/img/tipe-rumah/standart/std6.webp', alt: 'Standard Mezzanine 30/60 - Kamar Mandi' },
        { src: 'assets/img/tipe-rumah/standart/std7.webp', alt: 'Standard Mezzanine 30/60 - Kamar Mandi' }
      ],
      suite: [
        { src: 'assets/img/tipe-rumah/suite/suite-utama.webp', alt: 'Tipe Suite 50/60 - Tampak Depan' },
        { src: 'assets/img/tipe-rumah/suite/suite1.webp', alt: 'Tipe Suite 50/60 - Tampak Samping' },
        { src: 'assets/img/tipe-rumah/suite/suite2.webp', alt: 'Tipe Suite 50/60 - Ruang Tamu' },
        { src: 'assets/img/tipe-rumah/suite/suite3.webp', alt: 'Tipe Suite 50/60 - Kamar Tidur' },
        { src: 'assets/img/tipe-rumah/suite/suite4.webp', alt: 'Tipe Suite 50/60 - Dapur' },
        { src: 'assets/img/tipe-rumah/suite/suite5.webp', alt: 'Tipe Suite 50/60 - Kamar Mandi' }
      ],
      premium: [
        { src: 'assets/img/tipe-rumah/premium/premium-utama.webp', alt: 'Tipe Premium 50/120 - Tampak Depan' },
        { src: 'assets/img/tipe-rumah/premium/premium1.webp', alt: 'Tipe Premium 50/120 - Tampak Samping' },
        { src: 'assets/img/tipe-rumah/premium/premium2.webp', alt: 'Tipe Premium 50/120 - Ruang Tamu' },
        { src: 'assets/img/tipe-rumah/premium/premium3.webp', alt: 'Tipe Premium 50/120 - Kamar Tidur' },
        { src: 'assets/img/tipe-rumah/premium/premium4.webp', alt: 'Tipe Premium 50/120 - Dapur' },
        { src: 'assets/img/tipe-rumah/premium/premium5.webp', alt: 'Tipe Premium 50/120 - Kamar Mandi' }
      ]
    };

    btnGallery.forEach(btn => {
      btn.addEventListener('click', function() {
        const houseType = this.dataset.house;
        const galleryItems = galleries[houseType];
        
        const mainWrapper = document.querySelector('.gallery-main-slider .swiper-wrapper');
        const thumbWrapper = document.querySelector('.gallery-thumbnail-slider .swiper-wrapper');
        mainWrapper.innerHTML = '';
        thumbWrapper.innerHTML = '';
        
        galleryItems.forEach(item => {
          const mainSlide = document.createElement('div');
          mainSlide.className = 'swiper-slide';
          mainSlide.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy">`;
          mainWrapper.appendChild(mainSlide);
          
          const thumbSlide = document.createElement('div');
          thumbSlide.className = 'swiper-slide';
          thumbSlide.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="lazy">`;
          thumbWrapper.appendChild(thumbSlide);
        });
        
        const cardTitle = document.querySelector(`.type-card[data-type="${houseType}"] .type-card-title`);
        if (cardTitle) {
          document.querySelector('.gallery-title').textContent = cardTitle.textContent;
        }
        
        const galleryThumbs = new Swiper('.gallery-thumbnail-slider', {
          spaceBetween: 10,
          slidesPerView: 4,
          freeMode: true,
          watchSlidesProgress: true,
        });
        
        const galleryMain = new Swiper('.gallery-main-slider', {
          spaceBetween: 10,
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          thumbs: {
            swiper: galleryThumbs
          }
        });
        
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ========== TESTIMONIAL VIDEO ==========
  function initTestimonialVideos() {
    if (!btnPlayTestimonial.length || !videoModal || !videoIframe) return;

    btnPlayTestimonial.forEach(btn => {
      btn.addEventListener('click', function() {
        const videoId = this.dataset.videoId;
        videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // ========== FAQ ACCORDION ==========
  function initFAQAccordion() {
    if (!faqQuestions.length) return;

    faqQuestions.forEach(question => {
      question.addEventListener('click', function() {
        document.querySelectorAll('.faq-item').forEach(item => {
          if (item !== this.parentElement && item.querySelector('.faq-answer').classList.contains('active')) {
            item.querySelector('.faq-question').classList.remove('active');
            item.querySelector('.faq-answer').classList.remove('active');
            item.querySelector('.faq-answer').style.maxHeight = null;
          }
        });
        
        this.classList.toggle('active');
        const answer = this.nextElementSibling;
        answer.classList.toggle('active');
        
        if (answer.classList.contains('active')) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = null;
        }
      });
    });
  }

  // ========== BOOKING FORM ==========
  function initBookingForm() {
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const interest = document.getElementById('interest').value;
        const interestText = document.getElementById('interest').options[document.getElementById('interest').selectedIndex].text;
        const schedule = document.getElementById('schedule').value;
        const message = document.getElementById('message').value.trim();
        
        // Validation
        if (!name || !phone) {
            alert('Mohon lengkapi nama dan nomor WhatsApp Anda');
            return;
        }

        // Enhanced Islamic greeting with PROPER single-asterisk bold
        const currentHour = new Date().getHours();
        const greeting = `
*السلام عليكم ورحمة الله وبركاته*
${currentHour < 11 ? 'Selamat Pagi Penuh Berkah 🌄' : 
  currentHour < 15 ? 'Selamat Siang Penuh Berkah ☀️' :
  currentHour < 18 ? 'Selamat Sore Penuh Berkah 🌇' : 
  'Selamat Malam Penuh Berkah 🌙'}
`.trim();

        // Format date
        let formattedDate = 'Belum ditentukan';
        if (schedule) {
            formattedDate = new Date(schedule).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Construct message with SINGLE ASTERISK bold
        const whatsappMessage = `
${greeting}

*INFORMASI PEMESANAN KERTAMULYA RESIDENCE*
────────────────────────────────
*DATA PEMESAN*
• Nama Lengkap: ${name}
• Nomor WhatsApp: ${phone}

*DETAIL PEMESANAN*
• Tipe Rumah: ${interestText}
• Jadwal Survey: ${formattedDate}

${message ? `*CATATAN TAMBAHAN*\n"${message}"\n\n` : ''}
────────────────────────────────
Terima kasih atas minat Anda pada Kertamulya Residence. Tim kami akan menghubungi Anda dalam 1×24 jam.

*Hotline:* 0897-7771-080
*Website:* kertamulyaresidence.com

*Wassalamualaikum Warahmatullahi Wabarakatuh* 🤲
        `;

        // Proper encoding for WhatsApp (single asterisk)
        const encodedMessage = encodeURIComponent(whatsappMessage)
            .replace(/\*/g, '*')  // Maintain single asterisk
            .replace(/─/g, '%E2%94%80');

        window.open(`https://wa.me/628977771080?text=${encodedMessage}`, '_blank');
        
        showLiveNotification(name, interestText);
        this.reset();
    });
  }

 // ========== IMPROVED LIVE NOTIFICATION ==========
function showLiveNotification(name, action) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.compact-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'compact-notification';
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.addEventListener('click', (e) => {
      if (e.target.classList.contains('compact-notification-close')) {
        hideNotification();
      }
    });
  }

  // Notification data with character limits
  const notifications = [
    {
      name: name || "Ani Siti",
      action: truncateText(action || "Booking fee premium", 25),
      emoji: "🏡"
    },
    {
      name: "Budisanto",
      action: truncateText("Booking Fee Suite", 25),
      emoji: "💳"
    },
    {
      name: "Intan Cahyani",
      action: truncateText("Beli Tunai Suite", 25),
      emoji: "🎉"
    }
  ];

  // Select notification content
  const selected = name ? notifications[0] : notifications[Math.floor(Math.random() * notifications.length)];
  
  // Build notification HTML
  notification.innerHTML = `
    <div class="compact-notification-icon">
      <i class="fas fa-bell"></i>
    </div>
    <div class="compact-notification-content">
      <strong>${truncateText(selected.name, 12)}</strong> ${selected.action} ${selected.emoji}
    </div>
    <div class="compact-notification-close">
      &times;
    </div>
  `;
  
  // Show notification
  notification.classList.add('show');
  
  // Auto-hide after 5 seconds
  const autoHide = setTimeout(hideNotification, 5000);
  
  // Pause hide on hover
  notification.addEventListener('mouseenter', () => {
    clearTimeout(autoHide);
  });
  
  notification.addEventListener('mouseleave', () => {
    setTimeout(hideNotification, 2000);
  });

  function hideNotification() {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.innerHTML = '';
    }, 300);
  }
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

// Example usage:
// showLiveNotification(); // Random notification
// showLiveNotification("Bu Ani", "melakukan booking villa"); // Custom notification
  

  // ========== MODAL HANDLING ==========
  function initModals() {
    if (videoModalClose) {
      videoModalClose.addEventListener('click', function() {
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        videoIframe.src = '';
      });
    }
    
    if (galleryModalClose) {
      galleryModalClose.addEventListener('click', function() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
    
    if (videoModal) {
      videoModal.addEventListener('click', function(e) {
        if (e.target === this) {
          videoModal.classList.remove('active');
          document.body.style.overflow = '';
          videoIframe.src = '';
        }
      });
    }
    
    if (galleryModal) {
      galleryModal.addEventListener('click', function(e) {
        if (e.target === this) {
          galleryModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (videoModal) videoModal.classList.remove('active');
        if (galleryModal) galleryModal.classList.remove('active');
        document.body.style.overflow = '';
        if (videoIframe) videoIframe.src = '';
      }
    });
  }

  // ========== TESTIMONIAL SLIDER ==========
  function initTestimonialSlider() {
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (!testimonialSlider) return;

    new Swiper(testimonialSlider, {
      loop: true,
      spaceBetween: 30,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: {
          slidesPerView: 1,
          spaceBetween: 20
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 30
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 40
        }
      }
    });
  }

  // ========== SMOOTH SCROLL ==========
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;
          const urgencyBannerHeight = document.querySelector('.urgency-banner')?.offsetHeight || 0;
          const offset = headerHeight + urgencyBannerHeight;
          
          window.scrollTo({
            top: targetElement.offsetTop - offset,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ========== LIVE NOTIFICATIONS ==========
  function initLiveNotifications() {
    // Show initial random notification
    setTimeout(() => {
      showLiveNotification();
    }, 3000);

    // Show periodic notifications
    setInterval(() => {
      showLiveNotification();
    }, 15000);
  }

  // ========== INITIALIZE ALL FUNCTIONALITY ==========
  function initAll() {
    initMobileMenu();
    initUrgencyBanner();
    initAnimatedCounters();
    initHouseTypeTabs();
    initVideoPreviews();
    initGalleryModal();
    initTestimonialVideos();
    initFAQAccordion();
    initBookingForm();
    initModals();
    initTestimonialSlider();
    initSmoothScroll();
    initLiveNotifications();
    initDarkMode();
    
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100
      });
    }
  }

  // START THE APPLICATION
  initAll();
});