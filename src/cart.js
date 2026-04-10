import './style.css'

// ─── CART STATE ─── //
const CATALOG = [
  { id: 'grand-reserve', name: 'Grand Reserve', desc: 'Notes of dark cocoa and berries.', price: 2100, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&q=80' },
  { id: 'signature', name: 'Signature Blend', desc: 'Balanced with caramel sweetness.', price: 1500, image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&q=80' },
  { id: 'micro-climate', name: 'Micro Climate', desc: 'Bright, fruity, honey process.', price: 1900, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
  { id: 'selection', name: 'Early Selection', desc: 'Light roast, highly aromatic.', price: 1700, image: 'https://images.unsplash.com/photo-1518832553480-161bb7469796?w=400&q=80' },
  { id: 'sampler', name: 'Explorer Sampler', desc: 'Four 100g bags of our finest.', price: 3000, image: 'https://images.unsplash.com/photo-1498603536246-15572faa67a6?w=400&q=80' }
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
  <div class="chk-box">
    <span class="chk-close" id="chk-close">&times;</span>
    <div id="chk-form-area">
      <h2 class="chk-title">Secure Checkout</h2>
      <div class="chk-total-display">Amount Due: <span id="chk-final-price">₹0</span></div>
      
      <div class="chk-field">
        <label>Email Address</label>
        <input type="email" placeholder="you@example.com" />
      </div>
      <div class="chk-field">
        <label>Shipping Identity</label>
        <input type="text" placeholder="Full Name" />
      </div>
      <div class="chk-field">
        <label>Card Information</label>
        <div class="chk-card-sim">
          <input type="text" placeholder="0000 0000 0000 0000" maxlength="19" />
          <input type="text" placeholder="MM/YY" maxlength="5" />
          <input type="text" placeholder="CVC" maxlength="3" />
        </div>
      </div>
      
      <button class="chk-pay-btn" id="chk-pay-btn">Pay Now</button>
    </div>
    
    <div id="chk-success-area" style="display:none; text-align:center;">
      <div class="chk-check-icon">✓</div>
      <h2 class="chk-title">Payment Successful</h2>
      <p style="color:var(--cream); opacity:0.7; font-weight:300; font-size:14px; margin-top:10px;">Your Araku order is being prepared for the journey to your cup.</p>
      <button class="chk-pay-btn" id="chk-done-btn" style="margin-top:30px;">Continue Browsing</button>
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
const chkFinalPrice = document.getElementById('chk-final-price');

// ─── CORE LOGIC ─── //
function openCart() {
  renderCart();
  drawer.classList.add('open');
  overlay.classList.add('visible');
}

function closeCart() {
  drawer.classList.remove('open');
  overlay.classList.remove('visible');
}

window.addToCart = function(id) {
  const product = CATALOG.find(p => p.id === id);
  if (!product) return;
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  updateNavBadge();
  openCart(); // Show cart when added
};

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
overlay.addEventListener('click', closeCart);
closeBtn.addEventListener('click', closeCart);

document.addEventListener('click', e => {
  if (e.target.closest('#open-cart')) {
    e.preventDefault();
    openCart();
  }
});

// Checkout Mock
btnCheckout.addEventListener('click', () => {
  closeCart();
  checkoutModal.classList.add('visible');
  chkFinalPrice.textContent = totalPriceEl.textContent;
  
  document.getElementById('chk-form-area').style.display = 'block';
  document.getElementById('chk-success-area').style.display = 'none';
});

chkClose.addEventListener('click', () => {
  checkoutModal.classList.remove('visible');
});

const payBtn = document.getElementById('chk-pay-btn');
payBtn.addEventListener('click', () => {
  const originalText = payBtn.textContent;
  payBtn.textContent = 'Processing...';
  payBtn.style.opacity = '0.6';
  
  setTimeout(() => {
    payBtn.textContent = originalText;
    payBtn.style.opacity = '1';
    
    document.getElementById('chk-form-area').style.display = 'none';
    document.getElementById('chk-success-area').style.display = 'block';
    
    // Clear Cart
    cart = [];
    saveCart();
    updateNavBadge();
  }, 1500);
});

document.getElementById('chk-done-btn').addEventListener('click', () => {
  checkoutModal.classList.remove('visible');
});

// Initialize Nav badge on load
document.addEventListener('DOMContentLoaded', () => {
  updateNavBadge();
});
