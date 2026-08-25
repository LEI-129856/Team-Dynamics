const fs = require('fs');
const ExcelJS = require('exceljs');

async function addPayloadToExcel(payload, excelPath, options = {}) {
  console.log('>>> 5. dentro de addPayloadToExcel, a ler:', excelPath);
  const { startRow = 20, col = { cliente: 'A', data: 'B', valor: 'C' } } = options;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  console.log('>>> 6. ficheiro lido com sucesso');
  const worksheet = workbook.worksheets[0];

  let row = startRow;
  while (worksheet.getCell(`${col.cliente}${row}`).value) {
    row++;
  }
  console.log('>>> 6.5 linha livre encontrada:', row);

  worksheet.getCell(`${col.cliente}${row}`).value = `${payload.atividade} (${payload.cliente})`;
  worksheet.getCell(`${col.data}${row}`).value = payload.data;
  worksheet.getCell(`${col.valor}${row}`).value = parseInt(payload.valor);

  await workbook.xlsx.writeFile(excelPath);
  console.log('>>> 6.9 ficheiro escrito com sucesso');
}

module.exports = { addPayloadToExcel };