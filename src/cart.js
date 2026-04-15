import './style.css'

// ─── CART STATE ─── //
const CATALOG = [
  { id: 'p1', name: 'Grand Reserve Espresso', desc: 'Araku Valley, Lot 12 — 950m', price: 850, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=700&q=80', category: 'Whole Bean' },
  { id: 'p2', name: 'Washed Natural', desc: 'Eastern Ghats — 920m', price: 680, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=700&q=80', category: 'Ground' },
  { id: 'p3', name: 'Forest Honey', desc: 'Tribal Lot — 880m', price: 720, image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=700&q=80', category: 'Whole Bean' },
  { id: 'p4', name: 'Midnight Bloom', desc: 'Dark Roast Blend — 900m', price: 940, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700&q=80', category: 'Cold Brew' },
  { id: 'grand-reserve', name: 'Grand Reserve', desc: 'Notes of dark cocoa and berries.', price: 2100, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=600&q=80', category: 'Whole Bean' },
  { id: 'signature', name: 'Signature Blend', desc: 'Balanced with caramel sweetness.', price: 1500, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=80', category: 'Ground' },
  { id: 'micro-climate', name: 'Micro Climate', desc: 'Bright, fruity, honey process.', price: 1900, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', category: 'Whole Bean' },
  { id: 'selection', name: 'Early Selection', desc: 'Light roast, highly aromatic.', price: 1700, image: 'https://images.unsplash.com/photo-1518832553480-161bb7469796?w=600&q=80', category: 'Ground' },
  { id: 'sampler', name: 'Explorer Sampler', desc: 'Four 100g bags of our finest.', price: 3000, image: 'https://images.unsplash.com/photo-1498603536246-15572faa67a6?w=600&q=80', category: 'Capsules' }
];

let cart = JSON.parse(localStorage.getItem('araku_cart')) || [];

function saveCart() {
  localStorage.setItem('araku_cart', JSON.stringify(cart));
}

// ─── INJECT CART UI ─── //
const cartMarkup = `
<div class="cart-overlay" id="cart-overlay"></div>
<div class="cart-drawer" id="cart-drawer">
  <div class="cart-header">
    <h2>Your Cart</h2>
    <span class="cart-close" id="cart-close">&times;</span>
  </div>
  <div class="cart-items" id="cart-items">
    <!-- Items render here -->
  </div>
  <div class="cart-footer">
    <div class="cart-total">
      <span>Total</span>
      <span id="cart-total-price">₹0</span>
    </div>
    <button class="cart-checkout" id="cart-checkout-btn">Proceed to Checkout</button>
  </div>
</div>

<div class="checkout-modal" id="checkout-modal">
  <div class="chk-box shadcn-card">
    <span class="chk-close" id="chk-close">&times;</span>
    
    <!-- Step 1: User Details -->
    <div id="chk-details-area" class="shadcn-card-content" style="display:none;">
      <div class="chk-header-inline">
        <h2>Checkout Details</h2>
        <div class="chk-amount">Total: <span id="chk-details-total">₹0</span></div>
      </div>
      <div class="shadcn-form-area">
        <div class="field-col">
          <label for="cust-name">Full Name</label>
          <input id="cust-name" name="name" placeholder="John Doe" />
        </div>
        <div class="field-col">
          <label for="cust-email">Email Address</label>
          <input id="cust-email" name="email" type="email" placeholder="john@example.com" />
        </div>
        <div class="field-col">
          <label for="cust-phone">Phone Number</label>
          <input id="cust-phone" name="phone" type="tel" placeholder="+91 00000 00000" />
        </div>
      </div>
      <button class="btn-shadcn-primary" id="chk-continue-payment-btn">Continue to Payment</button>
    </div>

    <!-- Step 2: Payment Area -->
    <div id="chk-form-area" class="shadcn-card-content" style="display:none;">
      <div class="chk-header-inline">
        <h2>Payment Method</h2>
        <div class="chk-amount">Pay: <span id="chk-final-price">₹0</span></div>
      </div>

      <!-- Payment Options -->
      <div class="sp-grid-3">
        <button class="btn-outline-pay" type="button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#003087"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.02a.641.641 0 0 1 .633-.544h7.726c2.731 0 4.685.586 5.613 1.942.822 1.205.815 3.018-.088 5.617C17.925 12.632 15.344 14.8 11.235 14.8H9.351a.64.64 0 0 0-.638.557l-1.637 10.37zM4.025 4.09l-2.48 15.79h4.63l2.846-15.79H4.025z"/><path d="M11.666 12.607c3.488 0 5.656-1.83 6.467-4.148.813-2.333.682-4.12-.39-5.3-1.071-1.18-3.08-1.57-5.918-1.57H4.944C4.542 1.589 4.2 1.888 4.12 2.292L1.879 16.48a.641.641 0 0 0 .633.74h4.48c.324 0 .597-.246.638-.557l1.09-6.907c.046-.285.293-.496.581-.496h2.365z" fill="#009CDE"/><path d="M10.871 14.8h1.885c4.108 0 6.69-2.168 7.593-4.765.903-2.599.91-4.412.088-5.617-.611-.893-1.742-1.397-3.41-1.602-.751 3.553-3.42 5.688-7.857 5.688a.64.64 0 0 0-.638.557L7.491 15.65l-1.42 9.006c-.039.245.15.467.397.467h4.053l1.35-8.56z" fill="#012169"/></svg>
          PayPal
        </button>
        <button class="btn-outline-pay" type="button">
          <svg viewBox="0 0 384 512" width="20" height="20" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
          Pay
        </button>
        <button class="btn-outline-pay" type="button">
           <svg viewBox="0 0 48 48" width="22" height="22"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
           Pay
        </button>
      </div>

      <!-- Separator -->
      <div class="separator-line">
        <hr />
        <span>or pay using credit card</span>
        <hr />
      </div>

      <!-- Credit Card Form -->
      <div class="shadcn-form-area">
        <div class="field-col">
          <label for="cardholder-name">Card holder full name</label>
          <input id="cardholder-name" name="cardholderName" placeholder="Enter your full name" />
        </div>
        
        <div class="field-col">
          <label for="card-number">Card Number</label>
          <input id="card-number" name="cardNumber" placeholder="0000 0000 0000 0000" inputmode="numeric" />
        </div>

        <div class="field-col">
          <label for="expiry">Expiry Date / CVV</label>
          <div class="field-row">
            <input id="expiry" name="expiryDate" placeholder="MM/YY" />
            <input id="cvv" name="cvv" placeholder="CVV" inputmode="numeric" type="password" />
          </div>
        </div>
      </div>

      <button class="btn-shadcn-primary" id="chk-pay-btn">Complete Payment</button>
    </div>
    
    <!-- Step 3: Success Area -->
    <div id="chk-success-area" style="display:none; text-align:center;" class="shadcn-card-content">
      <div class="chk-check-icon">✓</div>
      <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #111;">Payment Successful</h2>
      <p style="color:#666; font-size:14px; margin-bottom: 24px;">Your Araku order is being prepared for the journey to your cup. <br><br> Confirmation sent to <span id="success-email" style="font-weight: 600; color: #333;">your email</span>.</p>
      <button class="btn-shadcn-primary" id="chk-done-btn">Continue Browsing</button>
    </div>
  </div>
</div>

<div class="choice-modal" id="order-choice-modal">
  <div class="choice-box">
    <button class="choice-close" id="choice-close" type="button" aria-label="Close order type popup">&times;</button>
    <h3 class="choice-title">Order Type</h3>
    <p class="choice-desc">How would you like to enjoy your Araku coffee today?</p>
    <div class="choice-btns">
      <div class="choice-btn" onclick="window.confirmOrderType('Take Away')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
        <span>Take Away</span>
      </div>
      <div class="choice-btn" onclick="window.confirmOrderType('Spot Order')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Spot Order</span>
      </div>
    </div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', cartMarkup);

// ─── DOM SELECTORS ─── //
const drawer = document.getElementById('cart-drawer');
const overlay = document.getElementById('cart-overlay');
const closeBtn = document.getElementById('cart-close');
const itemsArea = document.getElementById('cart-items');
const totalPriceEl = document.getElementById('cart-total-price');

const checkoutModal = document.getElementById('checkout-modal');
const chkClose = document.getElementById('chk-close');
const btnCheckout = document.getElementById('cart-checkout-btn');

const chkDetailsArea = document.getElementById('chk-details-area');
const chkFormArea = document.getElementById('chk-form-area');
const chkSuccessArea = document.getElementById('chk-success-area');

const chkDetailsTotal = document.getElementById('chk-details-total');
const chkFinalPrice = document.getElementById('chk-final-price');

const choiceModal = document.getElementById('order-choice-modal');
const choiceClose = document.getElementById('choice-close');
let pendingProductId = null;

function closeChoiceModal() {
  if (choiceModal) choiceModal.classList.remove('visible');
  pendingProductId = null;
}

// ─── CORE LOGIC ─── //
function openCart() {
  renderCart();
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('visible');
}

function closeCart() {
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('visible');
}

window.addToCart = function(id) {
  pendingProductId = id;
  if (choiceModal) choiceModal.classList.add('visible');
};

window.confirmOrderType = function(type) {
  if (!pendingProductId) return;
  const product = CATALOG.find(p => p.id === pendingProductId);
  if (!product) return;
  
  // Store with specific type key to allow mixed types of same product if needed
  // But for now we just append the type to the cart object
  const existing = cart.find(item => item.id === pendingProductId && item.orderType === type);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1, orderType: type });
  }
  
  closeChoiceModal();
  
  saveCart();
  updateNavBadge();
  openCart(); 
};

window.closeOrderChoiceModal = closeChoiceModal;

window.removeFromCart = function(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  updateNavBadge();
};

window.updateQuantity = function(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    window.removeFromCart(id);
  } else {
    saveCart();
    renderCart();
    updateNavBadge();
  }
};

function renderCart() {
  if (cart.length === 0) {
    itemsArea.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    totalPriceEl.textContent = '₹0';
    btnCheckout.style.display = 'none';
    return;
  }
  
  btnCheckout.style.display = 'block';
  let total = 0;
  
  itemsArea.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <div class="cart-item-img" style="background-image:url('${item.image}')"></div>
        <div class="cart-item-details">
          <h4>${item.name}</h4>
          <div class="cart-item-meta" style="font-size: 9px; color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">${item.orderType || 'Standard'}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="cart-item-ctrls">
            <button onclick="updateQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
      </div>
    `;
  }).join('');
  
  totalPriceEl.textContent = '₹' + total.toLocaleString('en-IN');
}

function updateNavBadge() {
  const counters = document.querySelectorAll('.cart-count');
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  counters.forEach(c => {
    c.textContent = count;
    if (count > 0) { c.style.display = 'flex'; }
    else { c.style.display = 'none'; }
  });
}

// ─── EVENT LISTENERS ─── //
if (overlay) overlay.addEventListener('click', closeCart);
if (closeBtn) closeBtn.addEventListener('click', closeCart);
if (choiceClose) choiceClose.addEventListener('click', closeChoiceModal);
if (choiceModal) {
  choiceModal.addEventListener('click', (e) => {
    if (e.target === choiceModal) closeChoiceModal();
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && choiceModal && choiceModal.classList.contains('visible')) {
    closeChoiceModal();
  }
});

document.addEventListener('click', e => {
  if (e.target.closest('#open-cart')) {
    e.preventDefault();
    openCart();
  }
});

// Checkout Flow
if (btnCheckout) {
  btnCheckout.addEventListener('click', () => {
    closeCart();
    checkoutModal.classList.add('visible');
    
    // Reset to Step 1
    chkDetailsArea.style.display = 'block';
    chkFormArea.style.display = 'none';
    chkSuccessArea.style.display = 'none';
    
    chkDetailsTotal.textContent = totalPriceEl.textContent;
    chkFinalPrice.textContent = totalPriceEl.textContent;
  });
}

const continueToPaymentBtn = document.getElementById('chk-continue-payment-btn');
if (continueToPaymentBtn) {
  continueToPaymentBtn.addEventListener('click', () => {
    // Basic validation
    const name = document.getElementById('cust-name').value;
    const email = document.getElementById('cust-email').value;
    const phone = document.getElementById('cust-phone').value;

    if (!name || !email || !phone) {
      alert('Please fill in all details to continue.');
      return;
    }

    // Transition to Step 2
    chkDetailsArea.style.display = 'none';
    chkFormArea.style.display = 'block';
  });
}

if (chkClose) {
  chkClose.addEventListener('click', () => {
    checkoutModal.classList.remove('visible');
  });
}

const payBtn = document.getElementById('chk-pay-btn');
if (payBtn) {
  payBtn.addEventListener('click', async () => {
    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();

    if (!name || !email || !phone) {
      alert('Please complete your details before payment.');
      return;
    }

    if (!cart.length) {
      alert('Your cart is empty. Add items before payment.');
      return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderPayload = {
      orderId: `ARK-${Date.now()}`,
      placedAt: new Date().toISOString(),
      customer: { name, email, phone },
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        orderType: item.orderType || 'Standard'
      })),
      total: totalAmount
    };

    const originalText = payBtn.textContent;
    payBtn.textContent = 'Sending confirmation...';
    payBtn.style.opacity = '0.6';
    payBtn.disabled = true;

    try {
      const res = await fetch('/.netlify/functions/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Payment confirmation email failed.');
      }

      document.getElementById('success-email').textContent = email;

      // Step 3: Success
      chkFormArea.style.display = 'none';
      chkSuccessArea.style.display = 'block';

      // Clear Cart
      cart = [];
      saveCart();
      updateNavBadge();
    } catch (error) {
      alert(error.message || 'Could not send confirmation email. Please try again.');
    } finally {
      payBtn.textContent = originalText;
      payBtn.style.opacity = '1';
      payBtn.disabled = false;
    }
  });
}

const doneBtn = document.getElementById('chk-done-btn');
if (doneBtn) {
  doneBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('visible');
    
    // Clear form fields
    document.getElementById('cust-name').value = '';
    document.getElementById('cust-email').value = '';
    document.getElementById('cust-phone').value = '';
    document.getElementById('cardholder-name').value = '';
    document.getElementById('card-number').value = '';
    document.getElementById('expiry').value = '';
    document.getElementById('cvv').value = '';
  });
}

// Initialize Nav badge on load
document.addEventListener('DOMContentLoaded', () => {
  updateNavBadge();
});
