
import { ScriptSegment } from "../types";

export const exportToDoc = (segments: ScriptSegment[], filenamePrefix: string = "Epic_Script") => {
  if (segments.length === 0) return;

  // Construct a HTML-based DOC content to preserve formatting
  const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Document</title></head><body>";
  const footer = "</body></html>";
  
  // Combine all segments into paragraphs
  const bodyContent = segments.map(seg => {
      // Clean content
      const cleanText = seg.content.replace(/\[THE_END\]/g, '').trim();
      // Convert newlines to breaks for HTML
      return `<p style="font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; margin-bottom: 1em; text-align: justify;">${cleanText.replace(/\n/g, '<br/>')}</p>`;
  }).join("");

  const sourceHTML = header + bodyContent + footer;
  
  const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = source;
  fileDownload.download = `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
};

export const exportToTxt = (segments: ScriptSegment[], filenamePrefix: string = "Prompts") => {
  if (segments.length === 0) return;

  const fullText = segments.map(s => s.content).join('');
  
  // Split by prompt header logic similar to visualizer display
  // Finds blocks starting with "PROMPT #<digits>:"
  const blocks = fullText.split(/(?=PROMPT\s+#\d+:)/i);
  
  const processedBlocks = blocks.map(block => {
      const cleanBlock = block.trim();
      // Ensure it's a prompt block
      if (!cleanBlock || !cleanBlock.toUpperCase().startsWith("PROMPT")) return null;
      
      // Remove the header "PROMPT #X:" to get just the prompt content
      const content = cleanBlock.replace(/PROMPT\s+#\d+:/i, '').trim();
      
      // Flatten content to single line: replace newlines and multiple spaces with single space
      // Also remove markdown bolding if present to make it clean for generators
      return content.replace(/\s+/g, ' ').replace(/\*\*/g, '');
  }).filter(Boolean); // Remove nulls

  // Join prompts with a blank line (double newline)
  const finalContent = processedBlocks.join('\n\n');

  const blob = new Blob([finalContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = url;
  fileDownload.download = `${filenamePrefix}_${new Date().toISOString().slice(0,10)}.txt`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
  URL.revokeObjectURL(url);
};
