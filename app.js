const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM
const productForm = document.getElementById('product-form');
const submitBtn = document.getElementById('submit-btn');
const formFeedback = document.getElementById('form-feedback');
const listState = document.getElementById('list-state');
const productsList = document.getElementById('products-list');
const DEFAULT_CATEGORIES = ['Electronice', 'Accesorii IT', 'Electrocasnice', 'Casa si Gradina']
const DEFAULT_PRODUCT_NAMES = [
  'Tastatura RGB',
  'Espressor Automat Cafea',
  'Set Unelte Gradinarit',
  'Monitor Gaming 27 Inch',
  'Mouse Wireless Ergonomic',
  'Aspirator Vertical',
  'Casti Bluetooth Noise-Cancelling',
  'Lampa Smart LED Wi-Fi',
  'Router Gigabit Dual-Band',
 ];

  // Gestionare stari UI
function setListState(state, customMessage = '') {
  listState.className = 'state-box';

  if (state === 'loading') {
    listState.textContent = customMessage || 'Se incarca produsele...';
    listState.classList.remove('hidden');
    productsList.classList.add('hidden');
  } else if (state === 'error') {
    listState.textContent = customMessage || 'Eroare la incarcarea catalogului.';
    listState.classList.add('error');
    listState.classList.remove('hidden');
    productsList.classList.add('hidden');
  } else if (state === 'empty') {
    listState.textContent = customMessage || 'Nu exista produse.';
    listState.classList.remove('hidden');
    productsList.classList.add('hidden');
  } else if (state === 'ready') {
    listState.classList.add('hidden');
    productsList.classList.remove('hidden');
  }
}

function syncEmptyState() {
  if (productsList.children.length === 0) {
    setListState('empty');
  } else {
    setListState('ready');
  }
}

function showFormFeedback(message, type = 'error') {
  formFeedback.textContent = message;
  formFeedback.className = `feedback ${type}`;
}

function clearFormFeedback() {
  formFeedback.textContent = '';
  formFeedback.className = 'feedback hidden';
}


 // Creare DOM
function normalizeProduct(item) {
  const fallbackName =
    DEFAULT_PRODUCT_NAMES[(item.id - 1) % DEFAULT_PRODUCT_NAMES.length] || `Produs #${item.id}`;

  return {
    id: item.id,
    name: item.name || fallbackName,
    price: item.price !== undefined ? Number(item.price) : item.id * 45 + 9.99,
    category: item.category || DEFAULT_CATEGORIES[item.id % DEFAULT_CATEGORIES.length],
  };
}

function createProductElement(rawItem) {
  const product = normalizeProduct(rawItem);

  const li = document.createElement('li');
  li.className = 'product-item';
  li.dataset.id = product.id;

  // Nume produs si buton stergere
  const headerDiv = document.createElement('div');
  headerDiv.className = 'product-header';

  const nameEl = document.createElement('h3');
  nameEl.className = 'product-name';
  nameEl.textContent = product.name;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'btn btn-danger delete-btn';
  deleteBtn.dataset.id = product.id;
  deleteBtn.textContent = 'Sterge';

  headerDiv.appendChild(nameEl);
  headerDiv.appendChild(deleteBtn);

  // Pret si categorie
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'product-details';

  const priceBadge = document.createElement('span');
  priceBadge.className = 'badge-price';
  priceBadge.textContent = `${product.price.toFixed(2)} RON`;

  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'badge-category';
  categoryBadge.textContent = product.category;

  detailsDiv.appendChild(priceBadge);
  detailsDiv.appendChild(categoryBadge);

  const metaEl = document.createElement('span');
  metaEl.className = 'product-meta';
  metaEl.textContent = `Cod produs: #${product.id}`;

  li.appendChild(headerDiv);
  li.appendChild(detailsDiv);
  li.appendChild(metaEl);

  return li;
}


 // Incarcarea produselor
async function loadProducts() {
  setListState('loading', 'Se incarca catalogul de produse...');

  try {
    const response = await fetch(`${API_URL}?_limit=6`);

    if (!response.ok) {
      let serverMsg = `Status ${response.status}`;
      try {
        const errData = await response.json();
        if (errData.message || errData.error) {
          serverMsg = errData.message || errData.error;
        }
      } catch {
    
      }
      throw new Error(`Eroare server (${response.status}): ${serverMsg}`);
    }

    const items = await response.json();
    productsList.replaceChildren();

    if (!Array.isArray(items) || items.length === 0) {
      setListState('empty');
      return;
    }

    items.forEach((item) => {
      const productEl = createProductElement(item);
      productsList.appendChild(productEl);
    });

    setListState('ready');
  } catch (error) {
    const isNetworkError = error instanceof TypeError;
    const message = isNetworkError
      ? 'Eroare de retea: Verifica conexiunea la internet'
      : error.message;

    setListState('error', message);
  }
}


 // Adaugarea unui produs nou
async function handleCreateProduct(event) {
  event.preventDefault();
  clearFormFeedback();

 
  const formData = new FormData(productForm);
  const payload = {
    name: formData.get('name').trim(),
    price: Number(formData.get('price')),
    category: formData.get('category').trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Se salveaza...';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Eroare 4xx sau 5xx
    if (!response.ok) {
      let serverMessage = 'Produsul nu a putut fi validat.';
      try {
        const errJson = await response.json();
        serverMessage = errJson.message || errJson.error || JSON.stringify(errJson);
      } catch {
        const errText = await response.text();
        if (errText) serverMessage = errText;
      }

      showFormFeedback(`Eroare (${response.status}): ${serverMessage}`, 'error');
      return;
    }

       const createdProduct = await response.json();
       const newProductEl = createProductElement(createdProduct);
    productsList.prepend(newProductEl);
    syncEmptyState();

    productForm.reset();
    showFormFeedback('Produsul a fost adaugat cu succes!', 'success');
  } catch (error) {
    showFormFeedback(
      'Eroare de retea: Incearcă din nou.',
      'error'
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Adauga în catalog';
  }
}


 //  Delete cu event delegation
async function handleListClick(event) {
  const deleteBtn = event.target.closest('.delete-btn');
  if (!deleteBtn) return;

  const productId = deleteBtn.dataset.id;
  const listItem = deleteBtn.closest('.product-item');
  if (!productId || !listItem) return;

  deleteBtn.disabled = true;
  deleteBtn.textContent = 'Se sterge...';

  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Eroare (Status ${response.status})`);
    }

    listItem.remove();
    syncEmptyState();
  } catch (error) {
    deleteBtn.disabled = false;
    deleteBtn.textContent = 'Sterge';
    showFormFeedback('Produsul nu a putut fi sters. Reincearca.', 'error');
  }
}


 // Event listener
productForm.addEventListener('submit', handleCreateProduct);
productsList.addEventListener('click', handleListClick);
document.addEventListener('DOMContentLoaded', loadProducts);