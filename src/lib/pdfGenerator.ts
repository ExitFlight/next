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

  const canvas = await html2canvas(ticketElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });

  const imageData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);

  pdf.save(`${fileName}.pdf`);
};
