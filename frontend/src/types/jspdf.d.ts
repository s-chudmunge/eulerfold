declare module 'jspdf' {
  interface jsPDF {
    splitTextToSize(text: string, maxWidth: number): string[];
  }
}