// Cloudinary Integration for UNO Restaurant QR Menu System

class CloudinaryUploader {
    constructor() {
        this.cloudName = CLOUDINARY_CONFIG.cloudName;
        this.uploadPreset = CLOUDINARY_CONFIG.uploadPreset;
        this.folder = CLOUDINARY_CONFIG.folder;
        this.apiUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
        
        this.init();
    }

    init() {
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        // Setup drag and drop for all file inputs
        document.addEventListener('DOMContentLoaded', () => {
            const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
            fileInputs.forEach(input => {
                this.setupFileInputDragDrop(input);
            });
        });
    }

    setupFileInputDragDrop(fileInput) {
        const container = fileInput.closest('.image-upload-area') || fileInput.parentElement;
        
        if (!container) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, () => {
                container.classList.remove('dragover');
            }, false);
        });

        // Handle dropped files
        container.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(files[0], fileInput);
            }
        }, false);

        // Handle file input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelection(e.target.files[0], fileInput);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleFileSelection(file, fileInput) {
        // Validate file
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            Utils.showToast(validation.error, 'danger');
            return;
        }

        // Show preview
        this.showImagePreview(file, fileInput);

        // Auto-upload if enabled
        if (fileInput.dataset.autoUpload !== 'false') {
            this.uploadImage(file, fileInput);
        }
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            return {
                isValid: false,
                error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
            };
        }

        if (file.size > maxSize) {
            return {
                isValid: false,
                error: 'File size must be less than 10MB'
            };
        }

        return { isValid: true };
    }

    showImagePreview(file, fileInput) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            // Find or create preview container
            let previewContainer = fileInput.parentElement.querySelector('.image-preview-container');
            
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'image-preview-container mt-3';
                fileInput.parentElement.appendChild(previewContainer);
            }

            previewContainer.innerHTML = `
                <div class="position-relative d-inline-block">
                    <img src="${e.target.result}" 
                         alt="Preview" 
                         class="image-preview img-thumbnail"
                         style="max-width: 200px; max-height: 200px;">
                    <button type="button" 
                            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onclick="cloudinaryUploader.removePreview(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        };

        reader.readAsDataURL(file);
    }

    removePreview(button) {
        const previewContainer = button.closest('.image-preview-container');
        if (previewContainer) {
            previewContainer.remove();
        }

        // Clear file input
        const fileInput = button.closest('form').querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    async uploadImage(file, fileInput) {
        try {
            // Show loading state
            this.showUploadProgress(fileInput, 0);

            // Prepare form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', this.folder);
            
            // Add transformation parameters
            formData.append('transformation', 'c_fill,w_800,h_600,q_auto,f_auto');

            // Upload to Cloudinary
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Hide loading state
            this.hideUploadProgress(fileInput);

            // Store the URL in a hidden input or data attribute
            this.storeUploadedUrl(result.secure_url, fileInput);

            // Show success message
            Utils.showToast('Image uploaded successfully!', 'success');

            // Trigger custom event
            fileInput.dispatchEvent(new CustomEvent('imageUploaded', {
                detail: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    originalFilename: file.name
                }
            }));

            return result;

        } catch (error) {
            console.error('Error uploading image:', error);
            this.hideUploadProgress(fileInput);
            Utils.showToast('Failed to upload image. Please try again.', 'danger');
            throw error;
        }
    }

    showUploadProgress(fileInput, progress) {
        // Find or create progress container
        let progressContainer = fileInput.parentElement.querySelector('.upload-progress');
        
        if (!progressContainer) {
            progressContainer = document.createElement('div');
            progressContainer.className = 'upload-progress mt-2';
            fileInput.parentElement.appendChild(progressContainer);
        }

        progressContainer.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Uploading...</span>
                </div>
                <div class="flex-grow-1">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" 
                             style="width: ${progress}%"
                             aria-valuenow="${progress}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                        </div>
                    </div>
                </div>
                <small class="ms-2 text-muted">${progress}%</small>
            </div>
        `;
    }

    hideUploadProgress(fileInput) {
        const progressContainer = fileInput.parentElement.querySelector('.upload-progress');
        if (progressContainer) {
            progressContainer.remove();
        }
    }

    storeUploadedUrl(url, fileInput) {
        // Store URL in a hidden input
        let hiddenInput = fileInput.parentElement.querySelector('input[type="hidden"][name$="Url"]');
        
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = fileInput.name + 'Url';
            fileInput.parentElement.appendChild(hiddenInput);
        }

        hiddenInput.value = url;

        // Also store in data attribute
        fileInput.dataset.uploadedUrl = url;
    }

    // Upload multiple images
    async uploadMultipleImages(files, onProgress = null) {
        const results = [];
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            try {
                const result = await this.uploadSingleImage(files[i]);
                results.push(result);

                if (onProgress) {
                    onProgress({
                        completed: i + 1,
                        total: total,
                        percentage: Math.round(((i + 1) / total) * 100),
                        currentFile: files[i].name,
                        result: result
                    });
                }
            } catch (error) {
                console.error(`Error uploading ${files[i].name}:`, error);
                results.push({ error: error.message, filename: files[i].name });
            }
        }

        return results;
    }

    async uploadSingleImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', this.folder);
        formData.append('transformation', 'c_fill,w_800,h_600,q_auto,f_auto');

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        return await response.json();
    }

    // Delete image from Cloudinary
    async deleteImage(publicId) {
        try {
            // Note: Deletion requires server-side implementation with API secret
            // This is a placeholder for the delete functionality
            console.log('Delete image:', publicId);
            
            // In a real implementation, you would call your backend API
            // that has the Cloudinary API secret to perform the deletion
            
            Utils.showToast('Image deletion requested', 'info');
            
        } catch (error) {
            console.error('Error deleting image:', error);
            Utils.showToast('Failed to delete image', 'danger');
        }
    }

    // Generate optimized URL with transformations
    getOptimizedUrl(publicId, options = {}) {
        const {
            width = 800,
            height = 600,
            crop = 'fill',
            quality = 'auto',
            format = 'auto'
        } = options;

        return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_${crop},w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
    }

    // Generate thumbnail URL
    getThumbnailUrl(publicId, size = 150) {
        return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_fill,w_${size},h_${size},q_auto,f_auto/${publicId}`;
    }

    // Extract public ID from Cloudinary URL
    extractPublicId(url) {
        const regex = /\/v\d+\/(.+)\./;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    // Validate Cloudinary URL
    isCloudinaryUrl(url) {
        return url && url.includes('cloudinary.com');
    }

    // Get image info from Cloudinary
    async getImageInfo(publicId) {
        try {
            const infoUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/${publicId}.json`;
            const response = await fetch(infoUrl);
            
            if (!response.ok) {
                throw new Error('Failed to get image info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting image info:', error);
            return null;
        }
    }

    // Create upload widget (alternative to file input)
    createUploadWidget(options = {}) {
        const defaultOptions = {
            cloudName: this.cloudName,
            uploadPreset: this.uploadPreset,
            folder: this.folder,
            sources: ['local', 'url', 'camera'],
            multiple: false,
            maxFileSize: 10000000, // 10MB
            maxImageWidth: 2000,
            maxImageHeight: 2000,
            cropping: true,
            croppingAspectRatio: 1.0,
            showSkipCropButton: false,
            croppingDefaultSelectionRatio: 1.0,
            eager: 'c_fill,w_800,h_600,q_auto,f_auto'
        };

        const widgetOptions = { ...defaultOptions, ...options };

        // Note: This requires the Cloudinary Upload Widget script to be loaded
        // Add this to your HTML: <script src="https://widget.cloudinary.com/v2.0/global/all.js"></script>
        
        if (typeof cloudinary !== 'undefined') {
            return cloudinary.createUploadWidget(widgetOptions, (error, result) => {
                if (!error && result && result.event === "success") {
                    console.log('Upload successful:', result.info);
                    
                    // Trigger custom event
                    document.dispatchEvent(new CustomEvent('cloudinaryUploadSuccess', {
                        detail: result.info
                    }));
                }
                
                if (error) {
                    console.error('Upload error:', error);
                    Utils.showToast('Upload failed', 'danger');
                }
            });
        } else {
            console.warn('Cloudinary Upload Widget not loaded');
            return null;
        }
    }
}

// Create global instance
const cloudinaryUploader = new CloudinaryUploader();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudinaryUploader;
}

