document.addEventListener('DOMContentLoaded', () => {
    // Delete functionality
    function handleDelete(item) {
        if (confirm('Are you sure you want to delete this item?')) {
            // If it's a featured item, move the first regular item to featured if available
            if (item.classList.contains('featured')) {
                const firstRegularItem = document.querySelector('.gallery-container .gallery-item');
                if (firstRegularItem) {
                    firstRegularItem.classList.add('featured');
                    document.querySelector('.featured-container').appendChild(firstRegularItem);
                }
            }
            item.remove();
        }
    }

    // Add delete event listeners to existing items
    document.querySelectorAll('.delete-button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent image modal from opening
            const galleryItem = e.target.closest('.gallery-item');
            handleDelete(galleryItem);
        });
    });

    // Filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.classList.contains(filterValue)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Add click handlers for move buttons
    const videoGallery = document.querySelector('.video-gallery');
    videoGallery.addEventListener('click', (e) => {
        if (!e.target.classList.contains('move-btn')) return;
        
        const button = e.target;
        const videoItem = button.closest('.gallery-item');
        
        if (button.classList.contains('up')) {
            const prevSibling = videoItem.previousElementSibling;
            if (prevSibling) {
                videoGallery.insertBefore(videoItem, prevSibling);
            }
        } else if (button.classList.contains('down')) {
            const nextSibling = videoItem.nextElementSibling;
            if (nextSibling) {
                videoGallery.insertBefore(nextSibling, videoItem);
            }
        }
    });

    // Modal functionality for images
    const modal = document.querySelector('.modal');
    const modalImg = document.querySelector('.modal-content');
    const closeModal = document.querySelector('.close-modal');
    const imageItems = document.querySelectorAll('.gallery-item.image');

    imageItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            modal.style.display = 'block';
            modalImg.src = img.src;
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // Upload functionality
    const uploadBtn = document.getElementById('uploadBtn');
    const mediaUrl = document.getElementById('mediaUrl');
    const mediaType = document.getElementById('mediaType');
    const galleryContainer = document.querySelector('.gallery-container');
    const featuredContainer = document.querySelector('.featured-container');

    uploadBtn.addEventListener('click', () => {
        const url = mediaUrl.value.trim();
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }

        // Create new gallery item
        const newItem = document.createElement('div');
        newItem.className = `gallery-item ${mediaType.value}`;

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleDelete(newItem);
        });
        newItem.appendChild(deleteButton);

        if (mediaType.value === 'image') {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Uploaded Image';
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            overlay.innerHTML = '<i class="fas fa-search"></i>';
            newItem.appendChild(img);
            newItem.appendChild(overlay);

            // Add click event for modal
            newItem.addEventListener('click', () => {
                const modal = document.querySelector('.modal');
                const modalImg = document.querySelector('.modal-content');
                modal.style.display = 'block';
                modalImg.src = img.src;
            });
        } else {
            // Handle YouTube videos
            let videoId = '';
            const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(youtubeRegex);
            
            if (match && match[1]) {
                videoId = match[1];
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${videoId}`;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allowfullscreen', '');
                newItem.appendChild(iframe);

                // Add move buttons
                const moveUpButton = document.createElement('button');
                moveUpButton.className = 'move-btn up';
                moveUpButton.textContent = 'Up';
                newItem.appendChild(moveUpButton);

                const moveDownButton = document.createElement('button');
                moveDownButton.className = 'move-btn down';
                moveDownButton.textContent = 'Down';
                newItem.appendChild(moveDownButton);
            } else {
                alert('Please enter a valid YouTube URL');
                return;
            }
        }

        // Add to featured section if it's empty
        if (featuredContainer.children.length === 0) {
            newItem.classList.add('featured');
            featuredContainer.appendChild(newItem);
        } else {
            galleryContainer.appendChild(newItem);
        }
    });

    // Add event listeners for video interaction
    const videoItems = document.querySelectorAll('.video-item');
    let hideTimeout;

    videoItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout);
            // Remove active class from all items
            videoItems.forEach(v => v.classList.remove('active'));
            // Add active class to current item
            item.classList.add('active');
        });

        item.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                item.classList.remove('active');
            }, 500); // Half second delay
        });

        // For touch devices
        item.addEventListener('touchstart', () => {
            clearTimeout(hideTimeout);
            // Remove active class from all items
            videoItems.forEach(v => v.classList.remove('active'));
            // Add active class to current item
            item.classList.add('active');
        });

        // Hide controls after inactivity
        let activityTimeout;
        const resetActivityTimer = () => {
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                item.classList.remove('active');
            }, 3000); // 3 seconds of inactivity
        };

        item.addEventListener('mousemove', resetActivityTimer);
        item.addEventListener('touchmove', resetActivityTimer);
    });

    // Video release dates (working days only)
    const videoSchedule = {
        'nastava': new Date('2023-11-27T08:00:00'),      // Monday
        'kabineti': new Date('2023-11-28T08:00:00'),     // Tuesday
        'modificirana': new Date('2023-11-29T08:00:00'),  // Wednesday
        'pedagog': new Date('2023-11-30T08:00:00'),      // Thursday
        'vospituvaci': new Date('2023-12-01T08:00:00'),  // Friday
        'obrazovni': new Date('2023-12-04T08:00:00')     // Monday
    };

    function padNumber(num) {
        return num.toString().padStart(2, '0');
    }

    function updateVideoAvailability() {
        const now = new Date();
        
        Object.entries(videoSchedule).forEach(([videoId, releaseDate]) => {
            const overlay = document.querySelector(`#${videoId}-overlay`);
            if (overlay) {
                if (now < releaseDate) {
                    const timeLeft = releaseDate - now;
                    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                    
                    let countdownText = '<strong>Видеото ќе биде достапно за:</strong><br>';
                    if (days > 0) {
                        countdownText += `${days} дена<br>`;
                    }
                    countdownText += `<span style="font-size: 1.4em">${padNumber(hours)}:${padNumber(minutes)}:${padNumber(seconds)}</span>`;
                    
                    overlay.innerHTML = countdownText;
                } else {
                    overlay.remove(); // Remove the overlay completely when video is available
                }
            }
        });
    }

    // Update countdown every second
    setInterval(updateVideoAvailability, 1000);
    updateVideoAvailability(); // Initial update

    function moveVideo(button, direction) {
        const videoItem = button.closest('.video-item');
        const gallery = videoItem.parentElement;
        
        switch(direction) {
            case 'up':
                const prev = videoItem.previousElementSibling;
                if (prev) {
                    gallery.insertBefore(videoItem, prev);
                }
                break;
            case 'down':
                const next = videoItem.nextElementSibling;
                if (next) {
                    gallery.insertBefore(next, videoItem);
                }
                break;
            case 'left':
                const prevSibling = videoItem.previousElementSibling;
                if (prevSibling) {
                    gallery.insertBefore(videoItem, prevSibling);
                }
                break;
            case 'right':
                const nextSibling = videoItem.nextElementSibling;
                if (nextSibling) {
                    gallery.insertBefore(nextSibling, videoItem);
                }
                break;
        }
    }
});
