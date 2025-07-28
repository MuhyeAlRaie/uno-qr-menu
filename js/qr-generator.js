// QR Code Generator for UNO Restaurant

class QRGenerator {
    constructor() {
        this.baseURL = window.location.origin + window.location.pathname.replace('/pages/qr-generator.html', '');
        this.generatedQRs = new Map();
        this.currentTableNumber = null;
    }

    // Initialize QR generator
    init() {
        console.log('QR Generator initialized');
        console.log('Base URL:', this.baseURL);
    }

    // Generate single QR code
    async generateSingle() {
        const tableNumber = document.getElementById('tableNumber').value;
        const qrSize = parseInt(document.getElementById('qrSize').value);
        
        if (!tableNumber) {
            this.showError('Please enter a table number');
            return;
        }
        
        if (tableNumber < 1 || tableNumber > 50) {
            this.showError('Table number must be between 1 and 50');
            return;
        }
        
        try {
            this.currentTableNumber = tableNumber;
            const qrData = `${this.baseURL}?view=menu&table=${tableNumber}`;
            const container = document.getElementById('singleQRCode');
            const infoContainer = document.getElementById('singleQRInfo');
            const actionsContainer = document.getElementById('singleQRActions');
            
            // Clear previous QR code
            container.innerHTML = '';
            
            // Generate QR code
            const canvas = await QRCode.toCanvas(qrData, {
                width: qrSize,
                height: qrSize,
                margin: 2,
                color: {
                    dark: '#2c3e50',
                    light: '#ffffff'
                }
            });
            
            // Add canvas to container
            container.appendChild(canvas);
            
            // Store generated QR
            this.generatedQRs.set(`table-${tableNumber}`, {
                canvas: canvas,
                tableNumber: tableNumber,
                qrData: qrData,
                size: qrSize
            });
            
            // Update info
            infoContainer.innerHTML = `
                <strong>Table ${tableNumber}</strong><br>
                <small class="text-muted">${qrData}</small>
            `;
            
            // Show actions
            actionsContainer.style.display = 'block';
            
            this.showSuccess(`QR code generated for Table ${tableNumber}`);
            
        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showError('Failed to generate QR code');
        }
    }

    // Download single QR code
    downloadSingle() {
        if (!this.currentTableNumber) {
            this.showError('No QR code to download');
            return;
        }
        
        const qrData = this.generatedQRs.get(`table-${this.currentTableNumber}`);
        if (!qrData) {
            this.showError('QR code not found');
            return;
        }
        
        this.downloadCanvas(qrData.canvas, `table-${this.currentTableNumber}-qr.png`);
    }

    // Print single QR code
    printSingle() {
        if (!this.currentTableNumber) {
            this.showError('No QR code to print');
            return;
        }
        
        const qrData = this.generatedQRs.get(`table-${this.currentTableNumber}`);
        if (!qrData) {
            this.showError('QR code not found');
            return;
        }
        
        this.printQRCode(qrData);
    }

    // Generate all QR codes
    async generateAll() {
        const totalTables = parseInt(document.getElementById('totalTables').value);
        const qrSize = parseInt(document.getElementById('bulkQrSize').value);
        const includeInfo = document.getElementById('includeTableInfo').checked;
        
        if (!totalTables || totalTables < 1 || totalTables > 100) {
            this.showError('Please enter a valid number of tables (1-100)');
            return;
        }
        
        try {
            const progressBar = document.getElementById('bulkProgress');
            const progressBarInner = progressBar.querySelector('.progress-bar');
            const actionsContainer = document.getElementById('bulkActions');
            const gridContainer = document.getElementById('qrCodesGrid');
            
            // Show progress bar
            progressBar.style.display = 'block';
            actionsContainer.style.display = 'none';
            
            // Clear previous QR codes
            gridContainer.innerHTML = '';
            this.generatedQRs.clear();
            
            // Generate QR codes
            for (let i = 1; i <= totalTables; i++) {
                const progress = (i / totalTables) * 100;
                progressBarInner.style.width = `${progress}%`;
                progressBarInner.textContent = `${i}/${totalTables}`;
                
                await this.generateTableQR(i, qrSize, includeInfo, gridContainer);
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            // Hide progress bar and show actions
            progressBar.style.display = 'none';
            actionsContainer.style.display = 'block';
            
            this.showSuccess(`Generated ${totalTables} QR codes successfully`);
            
        } catch (error) {
            console.error('Error generating QR codes:', error);
            this.showError('Failed to generate QR codes');
        }
    }

    // Generate QR code for a specific table
    async generateTableQR(tableNumber, size, includeInfo, container) {
        const qrData = `${this.baseURL}?view=menu&table=${tableNumber}`;
        
        // Create canvas
        const canvas = await QRCode.toCanvas(qrData, {
            width: size,
            height: size,
            margin: 2,
            color: {
                dark: '#2c3e50',
                light: '#ffffff'
            }
        });
        
        // Store generated QR
        this.generatedQRs.set(`table-${tableNumber}`, {
            canvas: canvas,
            tableNumber: tableNumber,
            qrData: qrData,
            size: size,
            includeInfo: includeInfo
        });
        
        // Create QR card
        const qrCard = this.createQRCard(tableNumber, canvas, qrData, includeInfo);
        container.appendChild(qrCard);
    }

    // Create QR card element
    createQRCard(tableNumber, canvas, qrData, includeInfo) {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        col.innerHTML = `
            <div class="card qr-card">
                <div class="card-body text-center">
                    <div class="qr-canvas-container mb-3">
                        <!-- Canvas will be inserted here -->
                    </div>
                    ${includeInfo ? `
                        <h6 class="card-title">Table ${tableNumber}</h6>
                        <p class="card-text small text-muted">Scan to view menu</p>
                        <div class="qr-url small text-muted mb-3">
                            <code>${qrData}</code>
                        </div>
                    ` : `
                        <h6 class="card-title">Table ${tableNumber}</h6>
                    `}
                    <div class="btn-group btn-group-sm w-100">
                        <button class="btn btn-outline-primary" onclick="qrGenerator.downloadTableQR(${tableNumber})" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="qrGenerator.printTableQR(${tableNumber})" title="Print">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="qrGenerator.copyTableURL(${tableNumber})" title="Copy URL">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert canvas
        const canvasContainer = col.querySelector('.qr-canvas-container');
        canvasContainer.appendChild(canvas);
        
        return col;
    }

    // Download table QR code
    downloadTableQR(tableNumber) {
        const qrData = this.generatedQRs.get(`table-${tableNumber}`);
        if (!qrData) {
            this.showError('QR code not found');
            return;
        }
        
        this.downloadCanvas(qrData.canvas, `table-${tableNumber}-qr.png`);
    }

    // Print table QR code
    printTableQR(tableNumber) {
        const qrData = this.generatedQRs.get(`table-${tableNumber}`);
        if (!qrData) {
            this.showError('QR code not found');
            return;
        }
        
        this.printQRCode(qrData);
    }

    // Copy table URL
    copyTableURL(tableNumber) {
        const qrData = this.generatedQRs.get(`table-${tableNumber}`);
        if (!qrData) {
            this.showError('QR code not found');
            return;
        }
        
        navigator.clipboard.writeText(qrData.qrData).then(() => {
            this.showSuccess(`URL copied for Table ${tableNumber}`);
        }).catch(() => {
            this.showError('Failed to copy URL');
        });
    }

    // Download all QR codes as ZIP
    async downloadAll() {
        if (this.generatedQRs.size === 0) {
            this.showError('No QR codes to download');
            return;
        }
        
        try {
            const zip = new JSZip();
            const folder = zip.folder('uno-restaurant-qr-codes');
            
            // Add each QR code to ZIP
            for (const [key, qrData] of this.generatedQRs) {
                const canvas = qrData.canvas;
                const dataURL = canvas.toDataURL('image/png');
                const base64Data = dataURL.split(',')[1];
                
                folder.file(`${key}.png`, base64Data, { base64: true });
            }
            
            // Generate ZIP file
            const content = await zip.generateAsync({ type: 'blob' });
            
            // Download ZIP
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'uno-restaurant-qr-codes.zip';
            link.click();
            
            this.showSuccess('QR codes downloaded as ZIP file');
            
        } catch (error) {
            console.error('Error creating ZIP:', error);
            this.showError('Failed to create ZIP file');
        }
    }

    // Print all QR codes
    printAll() {
        if (this.generatedQRs.size === 0) {
            this.showError('No QR codes to print');
            return;
        }
        
        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>UNO Restaurant QR Codes</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .qr-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
                    .qr-item { text-align: center; page-break-inside: avoid; border: 1px solid #ddd; padding: 15px; }
                    .qr-item h3 { margin: 10px 0; }
                    .qr-item canvas { border: 1px solid #ccc; }
                    .qr-url { font-size: 10px; color: #666; margin-top: 10px; word-break: break-all; }
                    @media print { .qr-item { break-inside: avoid; } }
                </style>
            </head>
            <body>
                <h1>UNO Restaurant & Café - Table QR Codes</h1>
                <div class="qr-grid">
        `);
        
        // Add each QR code
        for (const [key, qrData] of this.generatedQRs) {
            const canvas = qrData.canvas.cloneNode(true);
            printWindow.document.write(`
                <div class="qr-item">
                    <h3>Table ${qrData.tableNumber}</h3>
                    ${canvas.outerHTML}
                    <p>Scan to view menu</p>
                    <div class="qr-url">${qrData.qrData}</div>
                </div>
            `);
        }
        
        printWindow.document.write(`
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    // Download canvas as image
    downloadCanvas(canvas, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Print single QR code
    printQRCode(qrData) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Table ${qrData.tableNumber} QR Code</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        margin: 50px; 
                    }
                    .qr-container { 
                        border: 2px solid #333; 
                        padding: 30px; 
                        display: inline-block; 
                    }
                    h1 { margin-bottom: 20px; }
                    canvas { border: 1px solid #ccc; margin: 20px 0; }
                    .instructions { margin-top: 20px; font-size: 14px; color: #666; }
                    .url { font-size: 10px; color: #999; margin-top: 10px; word-break: break-all; }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>UNO Restaurant & Café</h1>
                    <h2>Table ${qrData.tableNumber}</h2>
                    ${qrData.canvas.outerHTML}
                    <div class="instructions">
                        <p><strong>Scan this QR code to view our digital menu</strong></p>
                        <p>Point your phone camera at the QR code</p>
                    </div>
                    <div class="url">${qrData.qrData}</div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'danger');
    }

    // Show notification
    showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.qr-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `qr-notification alert alert-${type} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// Global functions
window.generateSingleQR = function() {
    qrGenerator.generateSingle();
};

window.downloadSingleQR = function() {
    qrGenerator.downloadSingle();
};

window.printSingleQR = function() {
    qrGenerator.printSingle();
};

window.generateAllQRCodes = function() {
    qrGenerator.generateAll();
};

window.downloadAllQRCodes = function() {
    qrGenerator.downloadAll();
};

window.printAllQRCodes = function() {
    qrGenerator.printAll();
};

// Initialize QR generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrGenerator = new QRGenerator();
    qrGenerator.init();
    
    // Add enter key support for table number input
    document.getElementById('tableNumber').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateSingleQR();
        }
    });
});

