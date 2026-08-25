const fs = require('fs');
const path = require('path');

function normalizeText(text) {
  return text
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractAfterLabel(text, label) {
  const startIndex = text.toLowerCase().indexOf(label.toLowerCase() + ':');
  if (startIndex === -1) return null;
  
  const startValue = startIndex + label.length + 1;
  
  // Para "Atividade", para no padrão "(x pax.)"
  if (label.toLowerCase() === 'atividade') {
    const match = text.slice(startValue).match(/^([^(]+?)(?=\s*\(\d+\s*pax\.?\))/i);
    return match ? match[1].trim() : null;
  }
  
  const nextLabel = text.slice(startValue).search(/(?:Cliente|Atividade|Valor|Dia):/i);
  
  if (nextLabel === -1) {
    return text.slice(startValue).trim();
  }
  
  return text.slice(startValue, startValue + nextLabel).trim();
}

function extractDate(text) {
  const regex = /dia\s+(\d{1,2})\s+de\s+([A-Za-zÀ-ÿ]+)/i;
  const match = text.match(regex);

  if (!match) {
    return null;
  }

  const day = match[1].padStart(2, '0');
  const month = monthNameToNumber(match[2]);
  const year = new Date().getFullYear();

  if (!month) {
    return null;
  }

  return `${day}/${month}/${year}`;
}

function monthNameToNumber(monthName) {
  const months = {
    janeiro: '01',
    fevereiro: '02',
    marco: '03',
    março: '03',
    abril: '04',
    maio: '05',
    junho: '06',
    julho: '07',
    agosto: '08',
    setembro: '09',
    outubro: '10',
    novembro: '11',
    dezembro: '12'
  };

  return months[monthName.toLowerCase()] || null;
}

function extractValue(text) {
  const regex = /valor:\s*(\d+)\s*€?/i;
  const match = text.match(regex);
  return match ? `${match[1]}€` : null;
}

function buildPayload(message) {
  const normalizedText = normalizeText(message);

  return {
    cliente: extractAfterLabel(normalizedText, 'Cliente'),
    atividade: extractAfterLabel(normalizedText, 'Atividade'),
    data: extractDate(normalizedText),
    valor: extractValue(normalizedText)
  };
}

function saveJsonFile(payload, outputPath) {
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
}

module.exports = {
  buildPayload,
  saveJsonFile
};
