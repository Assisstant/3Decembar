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

        // Clear input
        mediaUrl.value = '';
    });

    // Simplifying drag and drop functionality for videos
    const videoGallery = document.querySelector('.video-gallery');
    const videos = document.querySelectorAll('.gallery-item.video');

    videos.forEach(video => {
        video.draggable = true;

        video.addEventListener('dragstart', () => {
            video.classList.add('dragging');
        });

        video.addEventListener('dragend', () => {
            video.classList.remove('dragging');
        });
    });

    videoGallery.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(videoGallery, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            videoGallery.appendChild(draggable);
        } else {
            videoGallery.insertBefore(draggable, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.gallery-item.video:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
});
