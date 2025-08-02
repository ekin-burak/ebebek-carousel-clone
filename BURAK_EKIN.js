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
                    this.buildHTML();
                    this.buildCSS();
                    this.setEvents();
                    this.updateCarouselView();
                });
            }); 
        },
        
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

        buildHTML() {
            // Doldurulacak 
            // alan 
        },

        buildCSS() {
            // Doldurulacak 
            // alan 
        },

        setEvents() {
            // Doldurulacak 
            // alan 
        }
    }

    ebebekCarousel.init();
})