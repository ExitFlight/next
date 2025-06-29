// src/lib/pdfGenerator.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export const downloadTicketAsPDF = async (
  elementId: string,
  fileName: string,
) => {
  const ticketElement = document.getElementById(elementId);
  if (!ticketElement) {
    console.error("Ticket element not found!");
    return;
  }

  // Use html2canvas to render the element to a canvas
  const canvas = await html2canvas(ticketElement, {
    scale: 2, // Increase scale for better resolution
    useCORS: true, // Important if you ever load images from other domains
    backgroundColor: null, // Use transparent background
  });

  const imageData = canvas.toDataURL("image/png");

  // Create a new jsPDF instance
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height], // Set PDF size to match the image
  });

  // Add the image to the PDF
  pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);

  // Download the PDF
  pdf.save(`${fileName}.pdf`);
};
