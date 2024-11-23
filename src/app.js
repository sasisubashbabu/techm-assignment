let products = [];
let itemsPerPage = 10;
let currentPage = 1;

function loadProducts() {
  const localData = localStorage.getItem("products");

  if (localData) {
    products = JSON.parse(localData);
    displayProductsWithPagination();
  } else {
    showShimmerLoader();
    fetch("https://fakestoreapi.com/products")
      .then(response => {
        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        products = data;
        localStorage.setItem("products", JSON.stringify(products));
        hideShimmerLoader();
        displayProductsWithPagination();
      })
      .catch(error => {
        console.error("Error fetching products:", error);
        hideShimmerLoader();
        alert("Failed to load products. Please try again later.");
      });
  }
}

function displayProductsWithPagination() {
  const filteredAndSortedProducts = applyFiltersAndSorting();
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  displayProducts(pageProducts);
  renderPagination(totalPages);
}

function displayProducts(productList) {
  const container = document.getElementById("product-container");
  const resultsCount = document.getElementById("results-count");

  container.innerHTML = "";
  resultsCount.textContent = `${productList.length} Results`;

  productList.forEach(product => {
    const truncatedTitle = truncateTitle(product.title);

    container.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4">
        <div class="product card shadow-sm p-3">
          <img src="${product.image}" alt="${product.title}" class="card-img-top" />
          <div class="product-title card-title" onclick="showFullTitle(this)" title="${product.title}">
            ${truncatedTitle}
          </div>
          <div class="product-price text-success">$${product.price}</div>
          <i class="fa fa-heart heart-icon" onclick="toggleFavorite(this)"></i>
        </div>
      </div>
    `;
  });
}

function renderPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i;
    pageButton.className = `btn btn-outline-primary me-1 ${
      i === currentPage ? "active" : ""
    }`;
    pageButton.addEventListener("click", () => changePage(i));
    paginationContainer.appendChild(pageButton);
  }
}

function changePage(pageNumber) {
  currentPage = pageNumber;
  displayProductsWithPagination();
}

function applyFiltersAndSorting() {
  // Filter products
  const selectedCategories = Array.from(document.querySelectorAll(".filters input:checked"))
    .map(checkbox => checkbox.value);

  let filteredProducts = products;
  if (selectedCategories.length > 0) {
    filteredProducts = products.filter(product =>
      selectedCategories.includes(product.category.toLowerCase()) // Ensure case-insensitivity
    );
  }

  // Sort products
  const sortOrder = document.getElementById("sort").value;
  if (sortOrder === "asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return filteredProducts;
}

function filterByCategory() {
  currentPage = 1; // Reset to the first page when filters are applied
  displayProductsWithPagination();
}

function sortByPrice() {
  currentPage = 1; // Reset to the first page when sorting is applied
  displayProductsWithPagination();
}

function truncateTitle(title) {
  return title.length > 20 ? title.substring(0, 20) + "..." : title;
}

function toggleFavorite(element) {
  element.classList.toggle("text-danger");
}

// Shimmer Loader Functions
function showShimmerLoader() {
  const shimmerContainer = document.getElementById("shimmer-container");
  shimmerContainer.innerHTML = "";
  for (let i = 0; i < itemsPerPage; i++) {
    shimmerContainer.innerHTML += `
      <div class="col-12 col-sm-6 col-md-4">
        <div class="shimmer shimmer-card"></div>
      </div>
    `;
  }
}

function hideShimmerLoader() {
  document.getElementById("shimmer-container").innerHTML = "";
}

// Initialize
document.addEventListener("DOMContentLoaded", loadProducts);

// Event Listeners
document.querySelectorAll(".filters input").forEach(input => {
  input.addEventListener("change", filterByCategory);
});
document.getElementById("sort").addEventListener("change", sortByPrice);
