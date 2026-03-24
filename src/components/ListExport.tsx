import { useState } from 'react';
import type { ShoppingItem, DietaryTag } from '../types';
import { DIETARY_LABELS } from '../types';
import { encodeListToUrl } from '../services/listSharing';

interface ListExportProps {
  items: ShoppingItem[];
  dietary: DietaryTag[];
}

export function ListExport({ items, dietary }: ListExportProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);

  if (items.length === 0) return null;

  const generateText = () => {
    let text = 'Shopping List\n';
    text += '=============\n\n';
    if (dietary.length > 0) {
      text += 'Dietary: ' + dietary.map(t => DIETARY_LABELS[t].label).join(', ') + '\n\n';
    }
    items.forEach(item => {
      text += `- ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}\n`;
    });
    text += `\n${items.length} items total`;
    return text;
  };

  const generateCSV = () => {
    let csv = 'Item,Quantity,Category\n';
    items.forEach(item => {
      csv += `"${item.name}",${item.quantity},"${item.category}"\n`;
    });
    return csv;
  };

  const copyText = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      prompt('Copy this:', text);
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareWhatsApp = () => {
    const text = generateText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareEmail = () => {
    const text = generateText();
    const subject = 'Shopping List from GShop';
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
  };

  const shareLink = async () => {
    const url = encodeListToUrl('Shopping List', items, dietary);
    copyText(url, 'link');
  };

  // Native share API (mobile)
  const nativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: 'Shopping List',
        text: generateText(),
      });
    } catch { /* user cancelled */ }
  };

  return (
    <div className="list-export">
      <button
        className="export-toggle"
        onClick={() => setShowExport(!showExport)}
      >
        {showExport ? 'Hide export options' : 'Export & Share'}
      </button>

      {showExport && (
        <div className="export-options">
          <div className="export-section">
            <span className="export-label">Share</span>
            <div className="export-btns">
              <button className="export-btn whatsapp" onClick={shareWhatsApp}>WhatsApp</button>
              <button className="export-btn email" onClick={shareEmail}>Email</button>
              <button className="export-btn link" onClick={shareLink}>
                {copiedType === 'link' ? 'Copied!' : 'Copy Link'}
              </button>
              {typeof navigator.share === 'function' && (
                <button className="export-btn native" onClick={nativeShare}>Share...</button>
              )}
            </div>
          </div>

          <div className="export-section">
            <span className="export-label">Copy</span>
            <div className="export-btns">
              <button className="export-btn" onClick={() => copyText(generateText(), 'text')}>
                {copiedType === 'text' ? 'Copied!' : 'As Text'}
              </button>
              <button className="export-btn" onClick={() => copyText(generateCSV(), 'csv')}>
                {copiedType === 'csv' ? 'Copied!' : 'As CSV'}
              </button>
            </div>
          </div>

          <div className="export-section">
            <span className="export-label">Download</span>
            <div className="export-btns">
              <button className="export-btn" onClick={() => downloadFile(generateText(), 'shopping-list.txt', 'text/plain')}>
                .txt
              </button>
              <button className="export-btn" onClick={() => downloadFile(generateCSV(), 'shopping-list.csv', 'text/csv')}>
                .csv
              </button>
              <button className="export-btn" onClick={() => {
                const json = JSON.stringify({ items, dietary }, null, 2);
                downloadFile(json, 'shopping-list.json', 'application/json');
              }}>
                .json
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
