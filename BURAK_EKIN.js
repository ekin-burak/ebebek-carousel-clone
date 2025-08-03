(() => {
    const ebebekCarousel = {
        API_URL: "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
        INSERT_AFTER : ".ins-preview-wrapper",
        PRODUCTS_LS_KEY: "productsKey",
        FAVORITES_LS_KEY: "favoritesKey",
        CAROUSEL_ID: "ebebek-carousel",

        products: [],
        favorites: [],
        currentIndex: 0,
        itemWidth: 0,
        visibleItems: 0,

        init()  {
            if(window.location.pathname !== "/") {
                console.log("wrong page");
                return;
            }

            this.loadJQuery(() => {
                this.loadFavorites();
                this.loadProducts().then(() => {
                    if (this.products && this.products.length > 0) {
                        this.buildHTML();
                        this.buildCSS();
                        this.setEvents();
                        this.updateCarouselView();
                    }
                });
            }); 
        },
        
        // JQuery load function
        loadJQuery(callback) {
            if(window.jQuery) {
                callback();
            } else {
                const script = document.createElement("script");
                script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
                script.onload = callback;
                document.head.appendChild(script);
            }
        },

        // Load favorites from localStorage
        loadFavorites() {
            const favorites = localStorage.getItem(this.FAVORITES_LS_KEY);
            if(favorites) {
                try {
                    const parsedFavorites = JSON.parse(favorites);
                    if(Array.isArray(parsedFavorites)) {
                        this.favorites = parsedFavorites;
                    }
                } catch(error) {
                    console.error("Error parsing favorites:", error);
                }
            } else {
                this.favorites = [];
            }
        },

        async loadProducts() {
            const products = localStorage.getItem(this.PRODUCTS_LS_KEY);
            if (products) {
                try {
                    const parsedProducts = JSON.parse(products);
                    if(Array.isArray(parsedProducts)) {
                        this.products = parsedProducts;
                        return;
                    }
                } catch(e) {
                    console.error("Error parsing products:", e);
                }
            }

            try {
                const response = await fetch(this.API_URL);
                if(!response.ok) {
                    throw new Error(`Error while fetching products! status: ${response.status}`);
                }
                const data = await response.json();
                if(Array.isArray(data)) {
                    this.products = data;
                    localStorage.setItem(this.PRODUCTS_LS_KEY, JSON.stringify(this.products));   
                } else {
                    this.products = [];
                }
            } catch(e) {
                console.error("Error fetching products:", e);
            }
        },

        // Insert HTML to the page
        buildHTML() {
            const productCardsHTML = this.products.map(product => this.createProductCardHTML(product)).join('');
            const carouselHTML = `
            <div id="${this.CAROUSEL_ID}" class="ebebek-carousel-container">
                <div class="ebebek-banner-title">   
                    <h2 class="ebebek-banner-title-primary">Beğenebileceğinizi düşündüklerimiz</h2>      
                </div>
                <div class="clone-carousel-wrapper">
                    <div class="ebebek-carousel-inner">
                        ${productCardsHTML}
                    </div>
                    <button class="ebebek-carousel-arrow ebebek-prev" style="display: none;">‹</button>
                    <button class="ebebek-carousel-arrow ebebek-next">›</button>
                </div>
            </div>           
            `;
            
            $(this.INSERT_AFTER).after(carouselHTML);
        },

        createProductCardHTML(product) {
            const isFavorite = this.favorites.includes(product.id);
            const favoriteIconSrc = isFavorite ? 'https://www.e-bebek.com/assets/svg/default-hover-favorite.svg' : 'https://www.e-bebek.com/assets/svg/default-favorite.svg';
            const favoriteIcon = `<img src="${favoriteIconSrc}" 
                                        onmouseover="this.src='https://www.e-bebek.com/assets/svg/default-hover-favorite.svg'" 
                                        onmouseout="if (!this.classList.contains('favorited')) { this.src='https://www.e-bebek.com/assets/svg/default-favorite.svg' }"
                                        alt="favorite" class="ebebek-heart-icon ${isFavorite ? 'favorited' : ''}">`;
            let priceHTML;

            if (product.original_price && product.price < product.original_price) {
                const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
                priceHTML = `
                        <div class="ebebek-discount-container">
                        <span class="ebebek-original-price">${product.original_price.toFixed(2).replace('.', ',')} TL</span>
                        <span class="ebebek-discount-badge">%${discount}</span>
                        </div>
                        <span class="ebebek-current-price-discount">${product.price.toFixed(2).replace('.', ',')} TL</span>
                    `;
            } else {
                priceHTML = `<div class="ebebek-price-container"><span class="ebebek-current-price">${product.price.toFixed(2).replace('.', ',')} TL</span></div>`;
            }
            
            return `<div class="ebebek-product-card" data-id="${product.id}" data-url="${product.url}">
                <div class="ebebek-card-top">
                    <div class="ebebek-heart" data-id="${product.id}">
                        ${favoriteIcon}
                    </div>
                    <a href="${product.url}" target="_blank" class="ebebek-product-link">
                        <img class="ebebek-product-image" src="${product.img}" alt="${product.name}">
                    </a>
                </div>
                <div class="ebebek-card-bottom">
                    <a href="${product.url}" target="_blank" class="ebebek-product-link">
                        <div class="ebebek-product-name"><b>${product.brand} - </b> ${product.name}</div>
                    </a>
                    <div class="ebebek-star-container">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                    </div>
                    ${priceHTML}
                </div>
                <div class="product-item-container">
                    <button class="ebebek-add-to-cart-btn">Sepete Ekle</button>
                </div>
            </div>`;
        },

        // Inject CSS for the carousel
        buildCSS() {
            const css = `
                :root {
                --ebebek-orange: #ff6000;
                --ebebek-light-orange: #fef6eb;
                --ebebek-border-color: #ededed;
                --ebebek-text-dark: #333;
                --ebebek-text-light: #757575;
                --ebebek-title-background-color: #fef6eb;
                --ebebek-title-color: #f28e00;
                --ebebek-discount-background-color: #eaf8f3;
                --ebebek-discount-text-color: #4bb788;
                }

                #${this.CAROUSEL_ID} {
                    max-width: 1290px;
                    margin: 0 auto;
                    font-family: Arial, sans-serif;
                }

                .clone-carousel-wrapper {
                    position: relative;
                    overflow: hidden;
                    padding: 20px 0;
                }

                .ebebek-carousel-inner {
                    display: flex;
                    transition: transform 0.2s ease-in-out;
                    padding: 0 15px; 
                }

                .ebebek-product-card {
                    flex: 0 0 calc(20% - 20px);
                    max-width: calc(20% - 20px);
                    margin: 10px;
                    font-family: Poppins, "cursive";
                    color: #7d7d7d;
                    border: 1px solid var(--ebebek-border-color);
                    border-radius: 10px;
                    text-decoration: none;
                    background-color: #fff;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                }   

                .ebebek-product-card:hover {
                    outline: 3px solid #f28e00;
                }

                .ebebek-card-bottom {
                    padding: 0 17px 13px;
                }

                .ebebek-card-top {
                    position: relative;
                }

                .ebebek-original-price + .ebebek-star-container {
                    padding-bottom: 15px;
                }

                .ebebek-product-link {
                    text-decoration: none;
                    color: inherit;
                }

                .ebebek-banner-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background-color: var(--ebebek-title-background-color);
                    padding: 25px 67px;
                    border-top-left-radius: 35px;
                    border-top-right-radius: 35px;
                    font-family: Quicksand-Bold;
                    font-weight: 700;
                }

                .ebebek-banner-title-primary {
                    font-family: Quicksand-Bold;
                    font-size: 3rem;
                    font-weight: 700;
                    line-height: 1.11;
                    color: var(--ebebek-title-color);
                    margin: 0;
                }

                .ebebek-discount-badge {
                    color: #00a365;
                    font-size: 18px;
                    font-weight: 700;
                    justify-content: center;

                }

                .ebebek-product-image {
                    max-width: 100%;
                    width: 100%;
                    height: 203px;
                    object-fit: contain;
                    margin-bottom: 45px;
                    align-items: center;
                }

                .ebebek-discount-container {
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    margin-top: -20px;
                }
                
                .ebebek-product-name {
                    font-size: 1.2rem;
                    color: #7d7d7d;
                    height: 40px; 
                    overflow: hidden;
                    margin-bottom: 10px;
                    padding: 0 15px;
                    line-height: 1.2222222222;
                }

                .ebebek-current-price-discount {
                    font-size: 2.2rem;
                    font-weight: 600;
                    color: #00a365;
                }

                .ebebek-price-container {
                    margin-bottom: 10px;
                }

                .ebebek-original-price {
                    text-decoration: line-through;
                    color: var(--ebebek-text-light);
                    font-size: 1.4rem;
                    font-weight: 500;
                    margin-right: 5px;
                }

                .ebebek-current-price {
                    font-size: 2.2rem;
                    font-weight: 600;
                    color: #7d7d7d;
                }

                .ebebek-add-to-cart-btn {
                    width: 100%;
                    padding: 15px 20px;
                    margin-top: 10px;
                    background-color: #fff7ec;
                    color: #f28e00;
                    border-radius: 37.5px;
                    cursor: pointer;
                    font-family: Poppins, "cursive";
                    font-weight: 700;
                    font-size: 1.4rem;
                    height: 48px;
                    max-height: 48px;
                    min-width: 48px;
                    vertical-align: middle;
                }

                .product-item-container {
                    padding: 0 17px 13px;
                }

                .ebebek-add-to-cart-btn:hover {
                    background-color: #f28e00;
                    color: #fff;
                    transition: all 0.2s ease;
                }

                .ebebek-carousel-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #f28e00;
                    background-color: #fef6eb;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 10;
                    background-position: 18px;
                    font-weight: 700;
                    border: none;
                }

                .ebebek-carousel-arrow:hover {
                    background-color: #fff;
                    color:  #f28e00;
                    border: 1px solid  #f28e00;
                }

                .ebebek-prev { left: 15px; }
                .ebebek-next { right: 15px; }
                
                .ebebek-heart-icon {
                    width: 25px;
                    height: 25px;
                    position: absolute;
                    top: 7px;
                    right: 7px;
                    object-fit: contain;
                }

                .ebebek-heart-icon:hover {
                    width: 25px;
                    height: 25px;
                    position: absolute;
                    top: 7px;
                    right: 7px;
                }

                .ebebek-heart {
                    position: absolute;
                    cursor: pointer;
                    background-color: #fff;
                    border-radius: 50%;
                    padding: 5px;
                    box-shadow: 0 2px 4px 0 #00000024;
                    width: 50px;
                    height: 50px;
                    right: 15px;
                    top: 10px;
                }

                .ebebek-heart:hover {
                    position: absolute;
                    cursor: pointer;
                    border-radius: 50%;
                    padding: 5px;
                    box-shadow: 0 2px 4px 0 #00000024;
                    width: 50px;
                    height: 50px;
                    right: 15px;
                    top: 10px;
                }
                
                .ebebek-heart-icon.favorited {
                    content: url('https://www.e-bebek.com/assets/svg/default-hover-favorite.svg');
                }

                .ebebek-star-container {
                    display: flex;
                    padding: 5px 0 15px 0;
                    margin-bottom: .5rem !important;
                }

                .fa-star {
                    display: inline-block;
                    font-size: 14px;
                    color: #fed100;
                    font-family: "Font Awesome 5 Free";
                    margin: 0 5px 0 2.5px;
                }
  
                /* --- Responsive Styles --- */
                @media (max-width: 1200px) {
                    .ebebek-product-card { 
                        flex-basis: calc(25% - 20px);
                        max-width: calc(25% - 20px);
                    } 
                }
                @media (max-width: 992px) {
                    .ebebek-product-card { 
                        flex-basis: calc(33.33% - 20px);
                        max-width: calc(33.33% - 20px);
                    }
                    .ebebek-banner-title-primary { font-size: 2rem; }
                    .ebebek-carousel-arrow { display: none; }
                }
                @media (max-width: 768px) {
                    .clone-carousel-wrapper { width: 100%; }
                    .ebebek-product-card { 
                        flex-basis: calc(50% - 20px);
                        max-width: calc(50% - 20px);
                    } 
                    .ebebek-banner-title { padding: 20px; }
                    .ebebek-banner-title-primary { font-size: 1.5rem; }
                    .ebebek-current-price { font-size: 1.8rem; }
                }
                @media (max-width: 576px) {
                    .ebebek-product-card { 
                        flex-basis: calc(80% - 20px);
                        max-width: calc(80% - 20px);
                        margin: 10px auto;
                    } 
                    .ebebek-carousel-inner { justify-content: center; }
                }
            `;
                
            $('<style>').addClass('ebebek-carousel-style').html(css).appendTo('head');
        },

        // Set events for the carousel
        setEvents() {
            const $carousel = $(`#${this.CAROUSEL_ID}`);
          
          $carousel.on('click', '.ebebek-next', () => this.moveCarousel(1));
          $carousel.on('click', '.ebebek-prev', () => this.moveCarousel(-1));
    
          $carousel.on('click', '.ebebek-heart', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const $wrapper = $(e.currentTarget);
              const productId = $wrapper.data('id');
              this.toggleFavorite(productId);

              const $icon = $wrapper.find('.ebebek-heart-icon');
              const isFavorite = this.favorites.includes(productId);

              $icon.toggleClass('favorited', isFavorite);
              
              if (isFavorite) {
                $icon.attr('src', 'https://www.e-bebek.com/assets/svg/default-hover-favorite.svg');
              } else {
                $icon.attr('src', 'https://www.e-bebek.com/assets/svg/default-favorite.svg');
              }
          });
          
          $carousel.on('click', '.ebebek-product-card a, .ebebek-product-card img, .ebebek-product-card .ebebek-product-name', function(e) {
              e.preventDefault();
              const url = $(this).closest('.ebebek-product-card').data('url');
              if(url) {
                  window.open(url, '_blank');
              }
          });
  
          $(window).on('resize', () => this.updateCarouselView());
        },

        moveCarousel(direction) {
            this.currentIndex += direction;
            this.updateCarouselView();
        },

        updateCarouselView() {
            const $inner = $('.ebebek-carousel-inner');
            const $cards = $('.ebebek-product-card');
            if ($cards.length === 0) return;
    
            const containerWidth = $('.clone-carousel-wrapper').width();
            this.itemWidth = $cards.first().outerWidth(true);
            this.visibleItems = Math.floor(containerWidth / this.itemWidth);
    
            const maxIndex = this.products.length - this.visibleItems;
            this.currentIndex = Math.max(0, Math.min(this.currentIndex, maxIndex));
            
            const offset = -this.currentIndex * this.itemWidth;
            $inner.css('transform', `translateX(${offset}px)`);
    
            $('.ebebek-prev').toggle(this.currentIndex > 0);
            $('.ebebek-next').toggle(this.currentIndex < maxIndex);
        },

        toggleFavorite(productId) {
            const index = this.favorites.indexOf(productId);
            if (index > -1) {
                this.favorites.splice(index, 1);
            } else {
                this.favorites.push(productId);
            }
            localStorage.setItem(this.FAVORITES_LS_KEY, JSON.stringify(this.favorites));
        }
    };

    ebebekCarousel.init();
})();