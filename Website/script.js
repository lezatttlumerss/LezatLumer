document.addEventListener('DOMContentLoaded', () => {

  const app = {
    // =========================
    // UTILITIES
    // =========================
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    },

    focusTrap(element, closeCallback) {
      const focusableElements = element.querySelectorAll(
        'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];

      function handleKeyDown(e) {
        const isTabPressed = e.key === 'Tab';

        if (!isTabPressed) return;

        if (e.shiftKey) { // Shift + Tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            e.preventDefault();
          }
        } else { // Tab
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            e.preventDefault();
          }
        }
      }

      element.addEventListener('keydown', handleKeyDown);
      firstFocusableElement?.focus();

      return () => element.removeEventListener('keydown', handleKeyDown);
    },

    // Helper function to format currency to Rupiah
    formatRupiah(amount) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    },

    // =========================
    // INITIALIZATION
    // =========================
    init() {
      this.cacheDOMElements();
      this.setupGlobalEventListeners();
      this.navbar.init();
      this.sliders.init();
      this.reviews.init();
      this.loader.init();
      this.ui.init();
      this.forms.init();
      this.lightbox.init();
      this.menu.init();
      this.cart.init();
      this.variantModal.init();
      this.paymentModal.init();
    },

    // =========================
    // CACHE DOM ELEMENTS
    // =========================
    cacheDOMElements() {
      this.dom = {
        menu: document.querySelector('#menu-bars'),
        navbar: document.querySelector('header .flex .navbar'),
        sections: document.querySelectorAll('section'),
        navLinks: document.querySelectorAll('header .navbar a'),
        loaderContainer: document.querySelector('.loader-container'),
        backToTopBtn: document.getElementById('backToTopBtn'),
        darkModeToggle: document.getElementById('darkModeToggle'),
        htmlElement: document.documentElement,
        orderForm: document.getElementById('orderForm'),
        userIcon: document.querySelector('header .flex .icons .fa-user'),
        userFormContainer: document.querySelector('.user-form-container'),
        closeLoginForm: document.querySelector('#close-login-form'),
        loginForm: document.querySelector('#login-form'),
        signupForm: document.querySelector('#signup-form'),
        showSignupLink: document.querySelector('#show-signup'),
        showLoginLink: document.querySelector('#show-login'),
        newsletterBtn: document.querySelector('.newsletter-btn'),
        newsletterEmailInput: document.querySelector('.email-input'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        menuContainer: document.querySelector('#menu .box-container'),
        menuFiltersContainer: document.querySelector('.menu-filters'),
        toastContainer: document.getElementById('toast-container'),
        cartIcon: document.getElementById('cart-icon'),
        cartCount: document.getElementById('cart-count'),
        cartSidebar: document.getElementById('cart-sidebar'),
        cartOverlay: document.getElementById('cart-overlay'),
        closeCartBtn: document.getElementById('close-cart'),
        cartItemsContainer: document.getElementById('cart-items-container'),
        cartTotalPrice: document.getElementById('cart-total-price'),
        checkoutBtn: document.querySelector('.checkout-btn'),
        clearCartBtn: document.getElementById('clear-cart-btn'),
        reviewSliderWrapper: document.querySelector('.review-slider .swiper-wrapper'),
        lightbox: {
          overlay: document.querySelector('.lightbox-overlay'),
          image: document.querySelector('.lightbox-image'),
          close: document.querySelector('.lightbox-close'),
          prev: document.querySelector('.lightbox-prev'),
          next: document.querySelector('.lightbox-next'),
        },
        variantModal: {
          overlay: document.getElementById('variant-modal-overlay'),
          modal: document.getElementById('variant-modal'),
          close: document.getElementById('close-variant-modal'),
          title: document.getElementById('variant-modal-title'),
          productImage: document.getElementById('variant-product-image'),
          productName: document.getElementById('variant-product-name'),
          productPrice: document.getElementById('variant-product-price'),
          flavorOptions: document.getElementById('flavor-options'),
          toppingOptions: document.getElementById('topping-options'),
          quantity: document.getElementById('variant-quantity'),
          decreaseBtn: document.getElementById('decrease-qty'),
          increaseBtn: document.getElementById('increase-qty'),
          addBtn: document.getElementById('add-variant-to-cart'),
        },
        paymentModal: {
          overlay: document.getElementById('payment-modal-overlay'),
          modal: document.getElementById('payment-modal'),
          close: document.getElementById('close-payment-modal'),
          cashBtn: document.getElementById('payment-cash'),
          transferBtn: document.getElementById('payment-transfer'),
          confirmForm: document.getElementById('payment-confirm-form'),
          paymentMethod: document.getElementById('selected-payment-method'),
          customerName: document.getElementById('customer-name'),
          customerPhone: document.getElementById('customer-phone'),
          customerAddress: document.getElementById('customer-address'),
          orderSummary: document.getElementById('order-summary'),
          finalTotal: document.getElementById('final-total'),
          confirmBtn: document.getElementById('confirm-order-btn'),
          bankInfo: document.getElementById('bank-info'),
          senderBankSection: document.getElementById('sender-bank-section'),
          senderAccountSection: document.getElementById('sender-account-section'),
          senderBank: document.getElementById('sender-bank'),
          senderAccount: document.getElementById('sender-account'),
          copyRekening: document.getElementById('copy-rekening'),
        }
      };
    },

    // =========================
    // SETUP GLOBAL EVENT LISTENERS
    // =========================
    setupGlobalEventListeners() {
      // Event delegation for dynamically added elements
      document.body.addEventListener('click', (e) => {
        if (e.target.matches('.add-to-cart-btn')) {
          const item = {
            id: e.target.dataset.id,
            name: e.target.dataset.name,
            price: parseFloat(e.target.dataset.price),
            image: e.target.dataset.image,
          };
          
          // Check if item needs variant selection
          if (item.id === 'menu-3') { // CreamChesse Pudding
            this.variantModal.open(item);
          } else {
            this.cart.addItem(item);
            this.ui.showToast(`${item.name} , Berhasil masuk keranjang!`);
          }
        }
        
        // Handle quantity increase
        if (e.target.matches('.cart-item-qty-btn.increase')) {
          const index = parseInt(e.target.dataset.index);
          this.cart.increaseQuantity(index);
        }
        
        // Handle quantity decrease
        if (e.target.matches('.cart-item-qty-btn.decrease')) {
          const index = parseInt(e.target.dataset.index);
          this.cart.decreaseQuantity(index);
        }
        
        // Handle remove item
        if (e.target.matches('.cart-item-remove') || e.target.closest('.cart-item-remove')) {
          const btn = e.target.matches('.cart-item-remove') ? e.target : e.target.closest('.cart-item-remove');
          const index = parseInt(btn.dataset.index);
          this.cart.removeItem(index);
        }
      });
    },

    // =========================
    // NAVBAR MODULE
    // =========================
    navbar: {
      init() {
        app.dom.menu.onclick = () => this.toggle();
        window.addEventListener('scroll', app.throttle(() => {
          this.hide();
          this.updateActiveLinkOnScroll();
        }, 100));
      },
      toggle() {
        app.dom.menu.classList.toggle('fa-times');
        app.dom.navbar.classList.toggle('active');
      },
      hide() {
        app.dom.menu.classList.remove('fa-times');
        app.dom.navbar.classList.remove('active');
      },
      updateActiveLinkOnScroll() {
        app.dom.sections.forEach(sec => {
          const top = window.scrollY;
          const height = sec.offsetHeight;
          const offset = sec.offsetTop - 150;
          const id = sec.getAttribute('id');

          if (top >= offset && top < offset + height) {
            app.dom.navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`header .navbar a[href*=${id}]`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      },
    },

    // =========================
    // SWIPER SLIDERS
    // =========================
    sliders: {
      init() {
        new Swiper(".home-slider", {
          spaceBetween: 30,
          centeredSlides: true,
          autoplay: { delay: 7500, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          loop: true,
        });
      },
    },

    // =========================
    // REVIEWS MODULE
    // =========================
    reviews: {
      init() {
        this.renderReviews();
        // Initialize swiper after reviews are rendered
        new Swiper(".review-slider", {
          spaceBetween: 20,
          centeredSlides: true,
          autoplay: { delay: 7500, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          loop: true,
          breakpoints: {
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          },
        });
      },
      renderReviews() {
        if (app.dom.reviewSliderWrapper) {
          app.dom.reviewSliderWrapper.innerHTML = reviewData.map(review => this.createReviewHTML(review)).join('');
        }
      },
      createReviewHTML(review) {
        return `
          <div class="swiper-slide slide">
            <i class="fas fa-quote-right"></i>
            <div class="user">
              <img src="${review.image}" alt="Customer ${review.name}">
              <div class="user-info">
                <h3>${review.name}</h3>
                <div class="stars">
                  <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                </div>
                <div class="review-date">
                  <i class="fas fa-calendar-alt"></i>
                  <span>${review.date}</span>
                </div>
              </div>
            </div>
            <p>${review.text}</p>
          </div>
        `;
      }
    },

    // =========================
    // LOADER
    // =========================
    loader: {
      init() {
        setTimeout(this.fadeOut, 1000);
      },
      fadeOut() {
        app.dom.loaderContainer.classList.add('fade-out');
      },
    },

    // =========================
    // UI COMPONENTS
    // =========================
    ui: {
      init() {
        this.initTheme();
        app.dom.backToTopBtn.addEventListener('click', this.scrollToTop);
        if (app.dom.darkModeToggle) {
          app.dom.darkModeToggle.addEventListener('click', () => this.toggleTheme());
        }
        window.addEventListener('scroll', app.throttle(() => this.toggleBackToTopButton(), 200));
      },
      toggleBackToTopButton() {
        if (window.scrollY > 300) {
          app.dom.backToTopBtn.style.display = 'block';
        } else {
          app.dom.backToTopBtn.style.display = 'none';
        }
      },
      scrollToTop(e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedTheme) {
          this.setTheme(savedTheme);
        } else if (prefersDark) {
          this.setTheme('dark');
        } else {
          this.setTheme('light');
        }
      },
      setTheme(theme) {
        app.dom.htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
          app.dom.darkModeToggle.classList.replace('fa-moon', 'fa-sun');
        } else {
          app.dom.darkModeToggle.classList.replace('fa-sun', 'fa-moon');
        }
      },
      toggleTheme() {
        const currentTheme = app.dom.htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
      },
      showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.classList.add('toast', `toast-${type}`);
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        app.dom.toastContainer.appendChild(toast);
        setTimeout(() => {
          toast.classList.add('hide');
          toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
      },
    },

    // =========================
    // FORMS MODULE
    // =========================
    forms: {
      removeFocusTrap: null,
      init() {
        if (app.dom.orderForm) {
          app.dom.orderForm.addEventListener('submit', this.validateOrderForm);
        }
        this.initAuthForms();
        this.initNewsletter();
      },
      validateOrderForm(event) {
        event.preventDefault();
        const form = app.dom.orderForm;
        if (!form) return;

        let isFormValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        form.querySelectorAll('.input-group').forEach(group => {
            const input = group.querySelector('input, textarea');
            const errorEl = group.querySelector('.error-message');
            if (input) input.classList.remove('invalid');
            if (errorEl) errorEl.textContent = '';
        });

        requiredFields.forEach(field => {
            const group = field.closest('.input-group');
            const errorEl = group.querySelector('.error-message');
            let message = '';

            if (field.validity.valueMissing) {
                message = 'This field is required.';
            } else if (field.type === 'number' && field.validity.rangeUnderflow) {
                message = `Must be at least ${field.min}.`;
            } else if (field.type === 'datetime-local' && !field.value) {
                message = 'Please select a date and time.';
            } else if (!field.checkValidity()) {
                message = 'Please enter a valid value.';
            }

            if (message) {
                isFormValid = false;
                field.classList.add('invalid');
                if (errorEl) errorEl.textContent = message;
            } else {
                field.classList.remove('invalid');
                if (errorEl) errorEl.textContent = '';
            }
        });

        if (isFormValid) {
            app.ui.showToast('Order placed successfully! Thank you.');
            form.reset();
        } else {
            app.ui.showToast('Please correct the errors in the form.', 'error');
            form.querySelector('.invalid')?.focus();
        }
      },

      initAuthForms() {
        const { userIcon, userFormContainer, closeLoginForm, loginForm, signupForm, showSignupLink, showLoginLink } = app.dom;
        if (!userIcon || !userFormContainer) return;

        userIcon.onclick = () => {
          userFormContainer.classList.add('active');
          this.removeFocusTrap = app.focusTrap(userFormContainer, closeForm);
        };
        const closeForm = () => {
          userFormContainer.classList.remove('active');
          if (this.removeFocusTrap) this.removeFocusTrap();
          loginForm.reset();
          signupForm.reset();
          loginForm.style.display = 'block';
          signupForm.style.display = 'none';
        };
        closeLoginForm.onclick = closeForm;

        showSignupLink.onclick = (e) => {
          e.preventDefault();
          loginForm.style.display = 'none';
          signupForm.style.display = 'block';
        };

        showLoginLink.onclick = (e) => {
          e.preventDefault();
          signupForm.style.display = 'none';
          loginForm.style.display = 'block';
        };

        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = loginForm.querySelector('input[type="email"]').value.trim();
          if (email) {
            app.ui.showToast(`Login successful for ${email}!`);
            closeForm();
          }
        });

        signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = signupForm.querySelector('input[type="text"]').value.trim();
          const email = signupForm.querySelector('input[type="email"]').value.trim();
          const password = signupForm.querySelector('input[type="password"]').value;
          const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

          if (password !== confirmPassword) {
            app.ui.showToast('Passwords do not match.', 'error');
            return;
          }
          if (name && email) {
            app.ui.showToast(`Account created for ${name} (${email})!`);
            closeForm();
          }
        });
      },

      initNewsletter() {
        const { newsletterBtn, newsletterEmailInput } = app.dom;
        if (newsletterBtn && newsletterEmailInput) {
          newsletterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = newsletterEmailInput.value.trim();
            if (email && /^[\S]+@[\S]+\.[\S]+$/.test(email)) {
              app.ui.showToast(`Thank you for subscribing, ${email}!`);
              newsletterEmailInput.value = '';
            } else {
              app.ui.showToast('Please enter a valid email address.', 'error');
            }
          });
        }
      },
    },

    // =========================
    // PAYMENT MODAL MODULE (NEW)
    // =========================
    paymentModal: {
      selectedPayment: '',
      removeFocusTrap: null,
      
      init() {
        const { close, overlay, cashBtn, transferBtn, confirmBtn, copyRekening } = app.dom.paymentModal;
        
        if (close) close.addEventListener('click', () => this.close());
        if (overlay) overlay.addEventListener('click', () => this.close());
        
        if (cashBtn) {
          cashBtn.addEventListener('click', () => this.selectPayment('cash'));
        }
        
        if (transferBtn) {
          transferBtn.addEventListener('click', () => this.selectPayment('transfer'));
        }
        
        if (confirmBtn) {
          confirmBtn.addEventListener('click', () => this.confirmOrder());
        }

        if (copyRekening) {
          copyRekening.addEventListener('click', () => this.copyRekeningNumber());
        }
      },
      
      open() {
        const { modal, overlay, confirmForm, orderSummary, finalTotal, bankInfo, senderBankSection, senderAccountSection } = app.dom.paymentModal;
        
        // Reset form
        this.selectedPayment = '';
        confirmForm.style.display = 'none';
        bankInfo.style.display = 'none';
        senderBankSection.style.display = 'none';
        senderAccountSection.style.display = 'none';
        
        document.querySelectorAll('.payment-option').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Clear form inputs
        if (app.dom.paymentModal.customerName) app.dom.paymentModal.customerName.value = '';
        if (app.dom.paymentModal.customerPhone) app.dom.paymentModal.customerPhone.value = '';
        if (app.dom.paymentModal.customerAddress) app.dom.paymentModal.customerAddress.value = '';
        if (app.dom.paymentModal.senderBank) app.dom.paymentModal.senderBank.value = '';
        if (app.dom.paymentModal.senderAccount) app.dom.paymentModal.senderAccount.value = '';
        
        // Show order summary
        const cartItems = app.cart.items;
        const total = app.cart.calculateTotal();
        
        let summaryHTML = '<div class="order-items">';
        cartItems.forEach(item => {
          summaryHTML += `
            <div class="summary-item">
              <span>${item.quantity}x ${item.name}</span>
              <span>${app.formatRupiah(item.price * item.quantity)}</span>
            </div>
          `;
          if (item.variantText) {
            summaryHTML += `<div class="summary-variant">${item.variantText}</div>`;
          }
        });
        summaryHTML += '</div>';
        
        orderSummary.innerHTML = summaryHTML;
        finalTotal.textContent = app.formatRupiah(total);
        
        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.removeFocusTrap = app.focusTrap(modal, () => this.close());
      },
      
      close() {
        const { modal, overlay } = app.dom.paymentModal;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this.removeFocusTrap) this.removeFocusTrap();
      },
      
      selectPayment(method) {
        this.selectedPayment = method;
        const { confirmForm, paymentMethod, cashBtn, transferBtn, bankInfo, senderBankSection, senderAccountSection } = app.dom.paymentModal;
        
        // Update button states
        cashBtn.classList.remove('selected');
        transferBtn.classList.remove('selected');
        
        if (method === 'cash') {
          cashBtn.classList.add('selected');
          paymentMethod.textContent = 'Cash (Bayar di Tempat)';
          bankInfo.style.display = 'none';
          senderBankSection.style.display = 'none';
          senderAccountSection.style.display = 'none';
        } else {
          transferBtn.classList.add('selected');
          paymentMethod.textContent = 'Transfer Bank BCA';
          bankInfo.style.display = 'block';
          senderBankSection.style.display = 'block';
          senderAccountSection.style.display = 'block';
        }
        
        // Show confirmation form
        confirmForm.style.display = 'block';
      },
      
      confirmOrder() {
        const { customerName, customerPhone, customerAddress, senderBank, senderAccount } = app.dom.paymentModal;
        
        // Validate inputs
        if (!this.selectedPayment) {
          app.ui.showToast('Silakan pilih metode pembayaran!', 'error');
          return;
        }
        
        if (!customerName.value.trim()) {
          app.ui.showToast('Nama harus diisi!', 'error');
          customerName.focus();
          return;
        }
        
        if (!customerPhone.value.trim()) {
          app.ui.showToast('Nomor telepon harus diisi!', 'error');
          customerPhone.focus();
          return;
        }
        
        if (!customerAddress.value.trim()) {
          app.ui.showToast('Alamat harus diisi!', 'error');
          customerAddress.focus();
          return;
        }

        // Validate sender bank info for transfer payment
        if (this.selectedPayment === 'transfer') {
          if (!senderBank.value) {
            app.ui.showToast('Silakan pilih bank pengirim!', 'error');
            senderBank.focus();
            return;
          }
          
          if (!senderAccount.value.trim()) {
            app.ui.showToast('Nomor rekening pengirim harus diisi!', 'error');
            senderAccount.focus();
            return;
          }
        }
        
        // Generate WhatsApp message
        this.sendToWhatsApp(
          customerName.value.trim(),
          customerPhone.value.trim(),
          customerAddress.value.trim(),
          senderBank.value,
          senderAccount.value.trim()
        );
      },
      
      copyRekeningNumber() {
        const rekeningNumber = '3621274994';
        
        // Try modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(rekeningNumber).then(() => {
            app.ui.showToast('Nomor rekening berhasil disalin!', 'success');
          }).catch(() => {
            this.fallbackCopyTextToClipboard(rekeningNumber);
          });
        } else {
          this.fallbackCopyTextToClipboard(rekeningNumber);
        }
      },

      fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          app.ui.showToast('Nomor rekening berhasil disalin!', 'success');
        } catch (err) {
          app.ui.showToast('Gagal menyalin nomor rekening', 'error');
        }
        
        document.body.removeChild(textArea);
      },
      
      sendToWhatsApp(name, phone, address, senderBank, senderAccount) {
        const cartItems = app.cart.items;
        const total = app.cart.calculateTotal();
        const paymentMethod = this.selectedPayment === 'cash' ? 'Cash (Bayar di Tempat)' : 'Transfer Bank BCA';
        
        // Build order details
        let orderDetails = `*PESANAN BARU - Lezat Lumer*\n\n`;
        orderDetails += `*Data Customer:*\n`;
        orderDetails += `• Nama: ${name}\n`;
        orderDetails += `• No. Telepon: ${phone}\n`;
        orderDetails += `• Alamat: ${address}\n\n`;
        
        orderDetails += `*Metode Pembayaran:* ${paymentMethod}\n\n`;
        
        if (this.selectedPayment === 'transfer') {
          orderDetails += `*Info Transfer Pengirim:*\n`;
          orderDetails += `• Bank: ${senderBank}\n`;
          orderDetails += `• No. Rekening: ${senderAccount}\n`;
          orderDetails += `• Atas Nama: ${name}\n\n`;
        }
        
        orderDetails += `*Detail Pesanan:*\n`;
        orderDetails += `━━━━━━━━━━━━━━━━\n`;
        
        cartItems.forEach((item, index) => {
          orderDetails += `${index + 1}. ${item.name}\n`;
          if (item.variantText) {
            orderDetails += `   ${item.variantText}\n`;
          }
          orderDetails += `   ${item.quantity}x ${app.formatRupiah(item.price)} = ${app.formatRupiah(item.price * item.quantity)}\n\n`;
        });
        
        orderDetails += `━━━━━━━━━━━━━━━━\n`;
        orderDetails += `*TOTAL PEMBAYARAN: ${app.formatRupiah(total)}*\n\n`;
        
        if (paymentMethod === 'Transfer Bank BCA') {
          orderDetails += `*Rekening Tujuan Transfer:*\n`;
          orderDetails += `Bank: BCA\n`;
          orderDetails += `No. Rek: 3621274994\n`;
          orderDetails += `A/n: Muhammad Faiz Anugrah\n\n`;
          orderDetails += `━━━━━━━━━━━━━━━━\n`;
          orderDetails += `*KIRIM BUKTI TRANSFER*\n`;
          orderDetails += `Mohon kirim foto/screenshot bukti transfer Anda melalui chat ini.\n\n`;
          orderDetails += `Terima kasih! `;
        }
        
        // Encode message for WhatsApp
        const waNumber = '6287773033706';
        const waMessage = encodeURIComponent(orderDetails);
        const waURL = `https://wa.me/${waNumber}?text=${waMessage}`;
        
        // Open WhatsApp
        window.open(waURL, '_blank');
        
        // Show reminder for transfer
        if (this.selectedPayment === 'transfer') {
          setTimeout(() => {
            this.showInstructionModal();
          }, 800);
        }
        
        // Clear cart and close modals
        app.cart.clear();
        this.close();
        app.cart.toggle(); // Close cart sidebar
        
        app.ui.showToast('Pesanan berhasil! Anda akan diarahkan ke WhatsApp.');
      },

      showInstructionModal() {
        const modalHTML = `
          <div class="instruction-modal-overlay" id="instruction-overlay">
            <div class="instruction-modal">
              <div class="instruction-header">
                <i class="fab fa-whatsapp"></i>
                <h3>Langkah Selanjutnya</h3>
              </div>
              <div class="instruction-body">
                <div class="instruction-step">
                  <div class="step-number">1</div>
                  <p><strong>Transfer</strong> sesuai total pembayaran ke rekening BCA yang tertera di chat WhatsApp</p>
                </div>
                <div class="instruction-step">
                  <div class="step-number">2</div>
                  <p><strong>Screenshot/foto</strong> bukti transfer dari m-banking/ATM</p>
                </div>
                <div class="instruction-step">
                  <div class="step-number">3</div>
                  <p><strong>Kirim foto bukti transfer</strong> melalui chat WhatsApp dengan cara:</p>
                  <ul style="margin: 10px 0 0 20px; padding: 0;">
                    <li>Klik tombol <strong>📎 (attachment)</strong></li>
                    <li>Pilih <strong>Gallery/Photo</strong></li>
                    <li>Kirim foto bukti transfer</li>
                  </ul>
                </div>
                <div class="instruction-step">
                  <div class="step-number">4</div>
                  <p>Admin akan <strong>memverifikasi pembayaran</strong> dan memproses pesanan Anda</p>
                </div>
              </div>
              <div class="instruction-footer">
                <button class="btn" onclick="document.getElementById('instruction-overlay').remove()">Mengerti, Saya Akan Mengirim Bukti Transfer!</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
      }
    },

    // =========================
    // VARIANT MODAL MODULE
    // =========================
    variantModal: {
      currentItem: null,
      removeFocusTrap: null,
      
      init() {
        const { close, overlay, decreaseBtn, increaseBtn, addBtn } = app.dom.variantModal;
        
        if (close) close.addEventListener('click', () => this.close());
        if (overlay) overlay.addEventListener('click', () => this.close());
        
        if (decreaseBtn) {
          decreaseBtn.addEventListener('click', () => {
            const qtyInput = app.dom.variantModal.quantity;
            if (qtyInput.value > 1) {
              qtyInput.value = parseInt(qtyInput.value) - 1;
            }
          });
        }
        
        if (increaseBtn) {
          increaseBtn.addEventListener('click', () => {
            const qtyInput = app.dom.variantModal.quantity;
            qtyInput.value = parseInt(qtyInput.value) + 1;
          });
        }
        
        if (addBtn) {
          addBtn.addEventListener('click', () => this.addToCart());
        }
      },
      
      open(item) {
        this.currentItem = item;
        const { modal, overlay, productImage, productName, productPrice, quantity } = app.dom.variantModal;
        
        // Set product info
        productImage.src = item.image;
        productName.textContent = item.name;
        productPrice.textContent = app.formatRupiah(item.price);
        
        // Reset form
        quantity.value = 1;
        const flavorRadios = app.dom.variantModal.flavorOptions.querySelectorAll('input[type="radio"]');
        if (flavorRadios.length > 0) flavorRadios[0].checked = true;
        
        const toppingChecks = app.dom.variantModal.toppingOptions.querySelectorAll('input[type="checkbox"]');
        toppingChecks.forEach(check => check.checked = false);
        
        // Show modal
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        this.removeFocusTrap = app.focusTrap(modal, () => this.close());
      },
      
      close() {
        const { modal, overlay } = app.dom.variantModal;
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        if (this.removeFocusTrap) this.removeFocusTrap();
      },
      
      addToCart() {
        // Get selected flavor
        const selectedFlavor = app.dom.variantModal.flavorOptions.querySelector('input[type="radio"]:checked');
        const flavor = selectedFlavor ? selectedFlavor.value : 'Matcha';
        
        // Get selected toppings
        const selectedToppings = Array.from(
          app.dom.variantModal.toppingOptions.querySelectorAll('input[type="checkbox"]:checked')
        ).map(check => check.value);
        
        // Get quantity
        const quantity = parseInt(app.dom.variantModal.quantity.value);
        
        // Create cart item with variants
        const cartItem = {
          ...this.currentItem,
          variants: {
            flavor: flavor,
            toppings: selectedToppings
          },
          variantText: this.getVariantText(flavor, selectedToppings),
          quantity: quantity
        };
        
        // Add to cart
        app.cart.addItem(cartItem, true);
        
        // Show success message
        const variantInfo = this.getVariantText(flavor, selectedToppings);
        app.ui.showToast(`${quantity}x ${cartItem.name} (${variantInfo}) ditambahkan ke keranjang!`);
        
        // Close modal
        this.close();
      },
      
      getVariantText(flavor, toppings) {
        let text = `Rasa: ${flavor}`;
        if (toppings.length > 0) {
          text += `, Topping: ${toppings.join(', ')}`;
        }
        return text;
      }
    },

    // =========================
    // MENU MODULE
    // =========================
    menu: {
      itemsPerPage: 9,
      currentPage: 1,
      currentFilter: 'all',
      filteredItems: [],

      init() {
        this.fetchAndRenderMenu();
        this.setupEventListeners();
      },

      setupEventListeners() {
        if (app.dom.loadMoreBtn) {
          app.dom.loadMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loadMore();
          });
        }

        if (app.dom.menuFiltersContainer) {
          app.dom.menuFiltersContainer.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
              this.handleFilterClick(e.target);
            }
          });
        }
      },

      fetchAndRenderMenu() {
        this.showLoader();
        setTimeout(() => {
          this.hideLoader();
          this.renderMenu();
        }, 800);
      },

      handleFilterClick(target) {
        const activeBtn = app.dom.menuFiltersContainer.querySelector('.active');
        if (activeBtn) activeBtn.classList.remove('active');
        target.classList.add('active');
        this.currentFilter = target.dataset.filter;
        this.currentPage = 1;
        this.renderMenu();
      },

      renderMenu() {
        if (this.currentFilter === 'all') {
          this.filteredItems = [...menuData];
        } else {
          this.filteredItems = menuData.filter(item => item.category === this.currentFilter);
        }

        const menuItemsToShow = this.filteredItems.slice(0, this.itemsPerPage);
        if (app.dom.menuContainer) {
          app.dom.menuContainer.innerHTML = menuItemsToShow.map(item => this.createMenuItemHTML(item)).join('');
        }

        if (app.dom.loadMoreBtn && app.dom.loadMoreBtn.parentElement) {
          if (this.filteredItems.length > this.itemsPerPage) {
            app.dom.loadMoreBtn.parentElement.style.display = 'block';
          } else {
            app.dom.loadMoreBtn.parentElement.style.display = 'none';
          }
        }
      },

      loadMore() {
        this.currentPage++;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = this.currentPage * this.itemsPerPage;
        const newItems = this.filteredItems.slice(start, end);
        if (app.dom.menuContainer) {
          app.dom.menuContainer.insertAdjacentHTML('beforeend', newItems.map(item => this.createMenuItemHTML(item)).join(''));
        }

        if (end >= this.filteredItems.length && app.dom.loadMoreBtn && app.dom.loadMoreBtn.parentElement) {
          app.dom.loadMoreBtn.parentElement.style.display = 'none';
        }
      },

      createMenuItemHTML(item) {
        return `
          <div class="box">
            <div class="image">
              <img src="${item.image}" data-large-src="${item.image}" alt="${item.name}" class="menu-item-image">
            </div>
            <div class="content">
              <div class="stars">
                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
              </div>
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <div class="price-action">
                <button class="btn add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">Tambah Keranjang</button>
                <span class="price">${app.formatRupiah(item.price)}</span>
              </div>
            </div>
          </div>
        `;
      },

      showLoader() {
        const loaderHTML = `<div class="menu-loader-container" style="display: block;"><div class="menu-loader"></div></div>`;
        if (app.dom.menuContainer) {
          app.dom.menuContainer.innerHTML = loaderHTML;
        }
      },

      hideLoader() {
        if (app.dom.menuContainer) {
          const loader = app.dom.menuContainer.querySelector('.menu-loader-container');
          if (loader) loader.style.display = 'none';
        }
      },
    },

    // =========================
    // LIGHTBOX MODULE
    // =========================
    lightbox: {
      currentImageIndex: 0,
      galleryImages: [],
      removeFocusTrap: null,

      init() {
        const { overlay, close, next, prev } = app.dom.lightbox;
        
        if (!overlay || !close || !next || !prev) return;
        
        if (app.dom.menuContainer) {
          app.dom.menuContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-item-image')) {
              this.galleryImages = Array.from(app.dom.menuContainer.querySelectorAll('.menu-item-image')).map(img => img.getAttribute('data-large-src') || img.src);
              this.currentImageIndex = this.galleryImages.indexOf(e.target.getAttribute('data-large-src') || e.target.src);
              this.open(this.galleryImages[this.currentImageIndex]);
            }
          });
        }

        close.addEventListener('click', () => this.close());
        next.addEventListener('click', () => this.showNext());
        prev.addEventListener('click', () => this.showPrev());
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.close();
        });
        document.addEventListener('keydown', (e) => {
          if (overlay.classList.contains('active')) {
            if (e.key === 'Escape') this.close();
            else if (e.key === 'ArrowRight') this.showNext();
            else if (e.key === 'ArrowLeft') this.showPrev();
          }
        });
      },

      open(imageSrc) {
        app.dom.lightbox.image.src = imageSrc;
        app.dom.lightbox.overlay.classList.add('active');
        this.removeFocusTrap = app.focusTrap(app.dom.lightbox.overlay, () => this.close());
        document.body.style.overflow = 'hidden';
      },

      close() {
        app.dom.lightbox.overlay.classList.remove('active');
        if (this.removeFocusTrap) this.removeFocusTrap();
        document.body.style.overflow = '';
      },

      showNext() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
        app.dom.lightbox.image.src = this.galleryImages[this.currentImageIndex];
      },

      showPrev() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
        app.dom.lightbox.image.src = this.galleryImages[this.currentImageIndex];
      },
    },

    // =========================
    // CART MODULE - UPDATED
    // =========================
    cart: {
      items: [],
      removeFocusTrap: null,
      init() {
        this.loadFromStorage();
        
        if (app.dom.cartIcon) {
          app.dom.cartIcon.addEventListener('click', () => this.toggle());
        }
        if (app.dom.closeCartBtn) {
          app.dom.closeCartBtn.addEventListener('click', () => this.toggle());
        }
        if (app.dom.cartOverlay) {
          app.dom.cartOverlay.addEventListener('click', () => this.toggle());
        }
        if (app.dom.checkoutBtn) {
          app.dom.checkoutBtn.addEventListener('click', () => this.checkout());
        }
        if (app.dom.clearCartBtn) {
          app.dom.clearCartBtn.addEventListener('click', () => this.clear());
        }
      },
      toggle() {
        if (!app.dom.cartSidebar || !app.dom.cartOverlay) return;
        
        const isActive = app.dom.cartSidebar.classList.toggle('active');
        app.dom.cartOverlay.classList.toggle('active');
        if (isActive) {
          this.removeFocusTrap = app.focusTrap(app.dom.cartSidebar, () => this.toggle());
        } else {
          if (this.removeFocusTrap) this.removeFocusTrap();
        }
      },
      addItem(itemToAdd, skipDuplicateCheck = false) {
        if (itemToAdd.variants || skipDuplicateCheck) {
          const existingItemIndex = this.items.findIndex(item => 
            item.id === itemToAdd.id && 
            item.variants && 
            item.variants.flavor === itemToAdd.variants?.flavor &&
            JSON.stringify(item.variants.toppings?.sort()) === JSON.stringify(itemToAdd.variants.toppings?.sort())
          );
          
          if (existingItemIndex !== -1) {
            this.items[existingItemIndex].quantity += (itemToAdd.quantity || 1);
          } else {
            this.items.push({ ...itemToAdd, quantity: itemToAdd.quantity || 1 });
          }
        } else {
          const existingItem = this.items.find(item => item.id === itemToAdd.id && !item.variants);
          if (existingItem) {
            existingItem.quantity++;
          } else {
            this.items.push({ ...itemToAdd, quantity: 1 });
          }
        }
        this.render();
        this.saveToStorage();
      },
      removeItem(index) {
        this.items.splice(index, 1);
        this.render();
        this.saveToStorage();
        app.ui.showToast('Item dihapus dari keranjang');
      },
      increaseQuantity(index) {
        this.items[index].quantity++;
        this.render();
        this.saveToStorage();
      },
      decreaseQuantity(index) {
        if (this.items[index].quantity > 1) {
          this.items[index].quantity--;
          this.render();
          this.saveToStorage();
        } else {
          this.removeItem(index);
        }
      },
      updateQuantity(index, quantity) {
        if (quantity > 0) {
          this.items[index].quantity = quantity;
        } else {
          this.removeItem(index);
        }
        this.render();
        this.saveToStorage();
      },
      calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      render() {
        if (!app.dom.cartItemsContainer || !app.dom.cartTotalPrice) return;
        
        if (this.items.length === 0) {
          app.dom.cartItemsContainer.innerHTML = '<p class="cart-empty">Keranjang anda kosong.</p>';
        } else {
          app.dom.cartItemsContainer.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
              <img src="${item.image}" alt="${item.name}">
              <div class="cart-item-details">
                <h4>${item.name}</h4>
                ${item.variantText ? `<p class="cart-variant-text">${item.variantText}</p>` : ''}
                <p class="cart-item-price">${app.formatRupiah(item.price)}</p>
              </div>
              <div class="cart-item-actions">
                <div class="cart-item-quantity-control">
                  <button class="cart-item-qty-btn decrease" data-index="${index}">-</button>
                  <div class="cart-item-quantity">${item.quantity}</div>
                  <button class="cart-item-qty-btn increase" data-index="${index}">+</button>
                </div>
                <button class="cart-item-remove" data-index="${index}" aria-label="Hapus item">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('');
        }
        app.dom.cartTotalPrice.textContent = app.formatRupiah(this.calculateTotal());
        this.updateCartIcon();
      },
      updateCartIcon() {
        if (!app.dom.cartCount) return;
        
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        app.dom.cartCount.textContent = totalItems;
        app.dom.cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
      },
      saveToStorage() {
        localStorage.setItem('restoCart', JSON.stringify(this.items));
      },
      loadFromStorage() {
        const storedCart = localStorage.getItem('restoCart');
        if (storedCart) {
          this.items = JSON.parse(storedCart);
        }
        this.render();
      },
      checkout() {
        if (this.items.length === 0) {
          app.ui.showToast('Keranjang Anda kosong!', 'error');
          return;
        }
        // Open payment modal instead of immediate checkout
        app.paymentModal.open();
      },
      clear() {
        if (this.items.length > 0) {
          this.items = [];
          this.render();
          this.saveToStorage();
          app.ui.showToast('Semua menu dihapus.');
        }
      },
    },
  };

  app.init();

});

const menuData = [
  { id: "menu-1", name: "Pudding Balls Coklat", price: 10000, image: "menu-1.jpg", description: "Pudding coklat lembut dengan isian lumer dan rasa manis yang bikin nagih.", category: "speciality" },
  { id: "menu-2", name: "Pudding Balls Mangga", price: 10000, image: "menu-2.jpg", description: "Pudding creamy berpadu rasa mangga segar, manis, dan menyegarkan.", category: "speciality" },
  { id: "menu-3", name: "CreamChesse Pudding", price: 12000, image: "menu-3.jpg", description: "Creamy risotto with wild mushrooms and parmesan cheese.", category: "speciality" },
  { id: "menu-10", name: "Dimsum Original", price: 11000, image: "menu-10.jpg", description: "Tender chicken in a creamy, spiced tomato and butter sauce.", category: "extra" },
  { id: "menu-11", name: "Dimsum Mentai", price: 12000, image: "menu-11.jpg", description: "Indian cottage cheese cubes in a smooth, creamy spinach gravy.", category: "extra" },
  { id: "menu-12", name: "Dimsum Mentai Spicy", price: 13000, image: "menu-12.jpg", description: "Spicy chickpea curry served with fluffy, deep-fried bread.", category: "extra" },
  { id: "menu-13", name: "Dimsum Mentai Chese", price: 14000, image: "menu-13.jpg", description: "Crispy rice crepe filled with a savory spiced potato mixture.", category: "extra" },
];

const reviewData = [
    {
        name: "sarah johnson",
        image: "pic-1.png",
        date: "October 26, 2023",
        text: "Amazing dining experience! The food quality is outstanding and the service is exceptional. I particularly loved the salmon fillet - it was cooked to perfection. Will definitely be coming back with family and friends."
    },
    {
        name: "mike chen",
        image: "pic-2.png",
        date: "October 22, 2023",
        text: "Best restaurant in town! The beef steak was incredibly tender and flavorful. The atmosphere is perfect for both casual dining and special occasions. Fast delivery service and friendly staff make it even better."
    },
    {
        name: "emma davis",
        image: "pic-3.png",
        date: "October 19, 2023",
        text: "Excellent food and presentation! I ordered the mushroom risotto and it exceeded all expectations. The ingredients are fresh, portions are generous, and prices are very reasonable. Highly recommend this place!"
    },
    {
        name: "alex martinez",
        image: "pic-4.png",
        date: "October 15, 2023",
        text: "Outstanding culinary experience! The variety of dishes is impressive and everything tastes authentic. The tiramisu for dessert was absolutely divine. Great value for money and excellent customer service throughout."
    },
    {
        name: "david lee",
        image: "pic-1.png",
        date: "October 12, 2023",
        text: "A hidden gem! The Chole Bhature was authentic and delicious. The service was quick and the staff was very friendly. It's my new go-to spot for Indian food. Can't wait to try more from their menu."
    }
];