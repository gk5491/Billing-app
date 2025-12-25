/**
 * PDF Utilities - Unified PDF generation from HTML views
 * Ensures PDF downloads match PDF views exactly
 */

/**
 * Check if a value contains unsupported color formats
 * html2canvas doesn't support oklch, oklab, lch, lab, hwb
 */
function hasUnsupportedColorFunction(value: string): boolean {
    const unsupportedFunctions = ['oklch', 'oklab', 'lch(', 'lab(', 'hwb(', 'color('];
    return unsupportedFunctions.some(fn => value.includes(fn));
}

/**
 * Convert or filter out unsupported color formats
 * Returns null if the value should be skipped entirely
 */
function safeColorValue(value: string, propName: string): string | null {
    // If it contains unsupported color functions, skip this property
    if (hasUnsupportedColorFunction(value)) {
        // For critical properties, try to provide a fallback
        if (propName === 'color') return 'rgb(0, 0, 0)'; // black text
        if (propName === 'background-color') return 'rgb(255, 255, 255)'; // white background
        if (propName.includes('border-color')) return 'rgb(0, 0, 0)'; // black border
        // For other properties, skip them
        return null;
    }
    return value;
}

/**
 * Deeply copy all computed styles to inline styles
 */
function copyComputedStylesToInline(element: HTMLElement, sourceElement: HTMLElement) {
    const computed = window.getComputedStyle(sourceElement);

    // Copy ALL computed style properties
    for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        let value = computed.getPropertyValue(prop);

        if (value) {
            // Filter out or convert unsupported color formats
            const safeValue = safeColorValue(value, prop);
            if (safeValue) {
                element.style.setProperty(prop, safeValue, 'important');
            }
            // If safeValue is null, skip this property entirely
        }
    }
}

/**
 * Create a clean clone with only inline styles, no classes or external CSS
 */
function createStyledClone(element: HTMLElement): HTMLElement {
    const clone = element.cloneNode(false) as HTMLElement;

    // Copy all computed styles to inline
    copyComputedStylesToInline(clone, element);

    // Remove class and id to prevent CSS matching
    clone.removeAttribute('class');
    clone.removeAttribute('id');

    // Recursively clone children
    Array.from(element.childNodes).forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const childClone = createStyledClone(child as HTMLElement);
            clone.appendChild(childClone);
        } else if (child.nodeType === Node.TEXT_NODE) {
            clone.appendChild(child.cloneNode(true));
        }
    });

    return clone;
}

export async function generatePDFFromElement(
    elementId: string,
    filename: string
): Promise<void> {
    try {
        // Dynamically import libraries
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');

        // Get the element to convert
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with id "${elementId}" not found`);
        }

        // Create a completely new iframe to isolate from all CSS
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.top = '0';
        iframe.style.width = element.scrollWidth + 'px';
        iframe.style.height = element.scrollHeight + 'px';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
            throw new Error('Could not access iframe document');
        }

        // Create a clean HTML structure with NO external CSS
        iframeDoc.open();
        iframeDoc.write('<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:0;"></body></html>');
        iframeDoc.close();

        // Create styled clone with all inline styles
        const styledClone = createStyledClone(element);
        iframeDoc.body.appendChild(styledClone);

        // Wait for iframe to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Generate canvas from iframe content
        const canvas = await html2canvas(iframeDoc.body, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        // Remove the iframe
        document.body.removeChild(iframe);

        // Calculate PDF dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if content is longer than one page
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(filename);
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
}

/**
 * Print the PDF view directly using browser print dialog
 */
export async function printPDFView(elementId: string, title: string): Promise<void> {
    const printContent = document.getElementById(elementId);
    if (!printContent) {
        console.error(`Element with id "${elementId}" not found`);
        return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        console.error('Failed to open print window');
        return;
    }

    // Get all computed styles and create inline styles
    const allElements = [printContent, ...Array.from(printContent.querySelectorAll('*'))];
    const styleMap = new Map<Element, string>();

    allElements.forEach((el) => {
        if (el instanceof HTMLElement) {
            let inlineStyle = '';

            const computed = window.getComputedStyle(el);

            for (let i = 0; i < computed.length; i++) {
                const prop = computed[i];
                let value = computed.getPropertyValue(prop);

                if (value && value !== 'none' && value !== 'auto') {
                    // Filter out unsupported color formats
                    const safeValue = safeColorValue(value, prop);
                    if (safeValue) {
                        inlineStyle += `${prop}: ${safeValue}; `;
                    }
                    // If safeValue is null, skip this property
                }
            }

            styleMap.set(el, inlineStyle);
        }
    });

    // Clone and apply inline styles
    const clone = printContent.cloneNode(true) as HTMLElement;
    const cloneElements = [clone, ...Array.from(clone.querySelectorAll('*'))];

    cloneElements.forEach((el, index) => {
        if (el instanceof HTMLElement) {
            const originalEl = allElements[index];
            const inlineStyle = styleMap.get(originalEl);
            if (inlineStyle) {
                el.setAttribute('style', inlineStyle);
            }
            el.removeAttribute('class');
        }
    });

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            color: #000;
            background: #fff;
          }
          @media print { 
            body { 
              margin: 0;
              padding: 0;
            }
            @page {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>${clone.outerHTML}</body>
    </html>
  `);

    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
}
