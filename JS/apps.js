// js/apps.js
document.addEventListener("DOMContentLoaded", function() {
  // Ensure PRODUCTS is defined
  if (typeof PRODUCTS !== 'undefined') {
    renderProducts(PRODUCTS);
  } else {
    console.error('PRODUCTS not defined. Check if products.js loaded correctly.');
  }
  
  // Initialize cart count
  updateCartUI();
});

function renderProducts(productList) {
  const grid = document.getElementById('productGrid');
  const countLabel = document.getElementById('itemCount');
  
  if (!grid) {
    console.error('Product grid not found');
    return;
  }
  
  grid.innerHTML = '';
  
  if (countLabel) {
    countLabel.textContent = productList.length + ' items';
  }
  
  productList.forEach(function(product) {
    const card = document.createElement('div');
    card.className = 'w3-col l3 s6 product-item fade-up';
    card.setAttribute('data-tag', product.category || 'all');
    card.setAttribute('data-id', product.id);
    
    const tagHTML = product.badge ? '<span class="w3-tag w3-display-topleft">' + product.badge + '</span>' : '';
    
    card.innerHTML = 
      '<div class="w3-container">' +
        '<div style="position:relative;">' +
          tagHTML +
          '<div class="image-wrap" onclick="openLightbox(\'' + product.image + '\')">' +
            '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
          '</div>' +
        '</div>' +
        '<div class="info">' +
          '<div class="name">' + product.name + '</div>' +
          '<div class="club">' + (product.club || '') + '</div>' +
          '<div class="price">GH₵' + product.price.toFixed(2) + '</div>' +
        '</div>' +
        '<div class="actions">' +
          '<button class="btn-buy" onclick="addToCart(\'' + product.id + '\')">Buy now</button>' +
          '<button class="btn-wishlist" onclick="toggleWishlist(\'' + product.id + '\')">' +
            '<i class="far fa-heart"></i>' +
          '</button>' +
        '</div>' +
      '</div>';
    
    grid.appendChild(card);
    
    // Trigger fade animation after a small delay
    setTimeout(function() {
      card.classList.add('visible');
    }, 50);
  });
}