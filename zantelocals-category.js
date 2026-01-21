// ===================================
// ZanteLocals - Category Page JavaScript
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // ===================================
    // Filter Functionality
    // ===================================
    const locationFilter = document.getElementById('location-filter');
    const priceFilter = document.getElementById('price-filter');
    const typeFilter = document.getElementById('type-filter');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const listingsGrid = document.getElementById('listings-grid');
    const resultsNumber = document.getElementById('results-number');

    // Get all listing cards
    const listings = Array.from(document.querySelectorAll('.listing-card'));

    // Filter function
    function filterListings() {
        const locationValue = locationFilter.value;
        const priceValue = priceFilter.value;
        const typeValue = typeFilter.value;

        let visibleCount = 0;

        listings.forEach(listing => {
            const listingLocation = listing.dataset.location;
            const listingPrice = listing.dataset.price;
            const listingType = listing.dataset.type;

            const locationMatch = locationValue === 'all' || listingLocation === locationValue;
            const priceMatch = priceValue === 'all' || listingPrice === priceValue;
            const typeMatch = typeValue === 'all' || listingType === typeValue;

            if (locationMatch && priceMatch && typeMatch) {
                listing.style.display = 'flex';
                visibleCount++;
                // Animate in
                setTimeout(() => {
                    listing.style.opacity = '1';
                    listing.style.transform = 'translateY(0)';
                }, 50 * visibleCount);
            } else {
                listing.style.opacity = '0';
                listing.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    listing.style.display = 'none';
                }, 300);
            }
        });

        // Update results count
        resultsNumber.textContent = visibleCount;

        // Show empty state if no results
        showEmptyState(visibleCount === 0);
    }

    // Show/hide empty state
    function showEmptyState(show) {
        let emptyState = document.querySelector('.empty-state');

        if (show && !emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-icon">🔍</div>
                <h3>No Results Found</h3>
                <p>Try adjusting your filters to find what you're looking for</p>
                <button class="btn btn-outline" onclick="document.getElementById('reset-filters').click()">
                    Reset Filters
                </button>
            `;
            listingsGrid.appendChild(emptyState);
        } else if (!show && emptyState) {
            emptyState.remove();
        }
    }

    // Reset filters
    function resetFilters() {
        locationFilter.value = 'all';
        priceFilter.value = 'all';
        typeFilter.value = 'all';
        filterListings();
    }

    // Event listeners
    if (locationFilter) locationFilter.addEventListener('change', filterListings);
    if (priceFilter) priceFilter.addEventListener('change', filterListings);
    if (typeFilter) typeFilter.addEventListener('change', filterListings);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

    // ===================================
    // Favorite Functionality
    // ===================================
    const favoriteBtns = document.querySelectorAll('.favorite-btn');

    favoriteBtns.forEach(btn => {
        // Load saved favorites from localStorage
        const listingId = btn.closest('.listing-card')?.querySelector('.btn-view-details')?.href.split('=')[1];
        if (listingId && isFavorite(listingId)) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            btn.classList.toggle('active');

            // Animate
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 200);

            // Save to localStorage
            if (listingId) {
                toggleFavorite(listingId);
            }
        });
    });

    function isFavorite(id) {
        const favorites = JSON.parse(localStorage.getItem('zantelocals_favorites') || '[]');
        return favorites.includes(id);
    }

    function toggleFavorite(id) {
        let favorites = JSON.parse(localStorage.getItem('zantelocals_favorites') || '[]');

        if (favorites.includes(id)) {
            favorites = favorites.filter(fav => fav !== id);
        } else {
            favorites.push(id);
        }

        localStorage.setItem('zantelocals_favorites', JSON.stringify(favorites));
    }

    // ===================================
    // Load More Functionality
    // ===================================
    const loadMoreBtn = document.getElementById('load-more');
    let currentPage = 1;
    const itemsPerPage = 9;

    if (loadMoreBtn) {
        // Initially hide listings beyond first page
        listings.forEach((listing, index) => {
            if (index >= itemsPerPage) {
                listing.style.display = 'none';
                listing.dataset.page = Math.floor(index / itemsPerPage) + 1;
            } else {
                listing.dataset.page = '1';
            }
        });

        loadMoreBtn.addEventListener('click', () => {
            currentPage++;

            // Show next page of listings
            listings.forEach(listing => {
                if (parseInt(listing.dataset.page) === currentPage) {
                    listing.style.display = 'flex';
                    listing.style.opacity = '0';
                    listing.style.transform = 'translateY(30px)';

                    setTimeout(() => {
                        listing.style.opacity = '1';
                        listing.style.transform = 'translateY(0)';
                    }, 50);
                }
            });

            // Hide button if no more listings
            const totalPages = Math.ceil(listings.length / itemsPerPage);
            if (currentPage >= totalPages) {
                loadMoreBtn.style.display = 'none';
            }

            // Scroll to first new listing
            const firstNewListing = document.querySelector(`[data-page="${currentPage}"]`);
            if (firstNewListing) {
                setTimeout(() => {
                    firstNewListing.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        });
    }

    // ===================================
    // Sticky Filters Bar
    // ===================================
    const filtersSection = document.querySelector('.filters-section');
    if (filtersSection) {
        const filtersOffset = filtersSection.offsetTop;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > filtersOffset) {
                filtersSection.classList.add('sticky');
            } else {
                filtersSection.classList.remove('sticky');
            }
        });
    }

    // ===================================
    // Quick View Modal (Optional Enhancement)
    // ===================================
    const listingCards = document.querySelectorAll('.listing-card');

    listingCards.forEach(card => {
        // Prevent modal from opening when clicking favorite or view details buttons
        card.addEventListener('click', (e) => {
            if (
                !e.target.closest('.favorite-btn') &&
                !e.target.closest('.btn-view-details')
            ) {
                // Optional: Add quick view modal here
                // console.log('Card clicked - open quick view modal');
            }
        });
    });

    // ===================================
    // Smooth Transitions for Listing Cards
    // ===================================
    listings.forEach(listing => {
        listing.style.transition = 'opacity 0.3s ease, transform 0.3s ease, display 0.3s ease';
    });

    // ===================================
    // URL Parameter Handling
    // ===================================
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    const locationParam = urlParams.get('location');
    const priceParam = urlParams.get('price');

    if (filterParam && typeFilter) {
        typeFilter.value = filterParam;
        filterListings();
    }

    if (locationParam && locationFilter) {
        locationFilter.value = locationParam;
        filterListings();
    }

    if (priceParam && priceFilter) {
        priceFilter.value = priceParam;
        filterListings();
    }

    // ===================================
    // Touch Gestures for Mobile
    // ===================================
    if ('ontouchstart' in window) {
        let touchStartX = 0;
        let touchEndX = 0;

        listingCards.forEach(card => {
            card.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            });

            card.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe(card, touchStartX, touchEndX);
            });
        });

        function handleSwipe(card, startX, endX) {
            const swipeThreshold = 100;
            const difference = startX - endX;

            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    // Swiped left - could add to favorites
                    const favoriteBtn = card.querySelector('.favorite-btn');
                    if (favoriteBtn) {
                        favoriteBtn.click();
                    }
                } else {
                    // Swiped right - could share or something else
                    console.log('Swiped right on card');
                }
            }
        }
    }

    // ===================================
    // Performance: Lazy Load Images
    // ===================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ===================================
    // Analytics (Optional)
    // ===================================
    function trackFilterUsage(filterType, value) {
        // Add your analytics tracking here
        console.log(`Filter used: ${filterType} = ${value}`);
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', () => {
            trackFilterUsage('location', locationFilter.value);
        });
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', () => {
            trackFilterUsage('price', priceFilter.value);
        });
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            trackFilterUsage('type', typeFilter.value);
        });
    }

    console.log('✅ Category page initialized');
});
