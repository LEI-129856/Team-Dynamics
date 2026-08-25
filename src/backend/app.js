const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildPayload } = require('./services/parserService');
const { jsonToExcel, addPayloadToExcel } = require('./excelConverter');

const USER_EXCEL_MAP = {
      type1: {
        template: path.join(__dirname, '..', 'data', 'Folha de Trabalhos Template.xlsx'),
        output: path.join(__dirname, '..', 'data', 'output', 'resultado_bruno.xlsx'),
        startRow: 20
      },
      type2: {
        template: path.join(__dirname, '..', 'data', 'Folha de Trabalhos Marta.xlsx'),
        output: path.join(__dirname, '..', 'data', 'output', 'resultado_marta.xlsx'),
        startRow: 10
      }
    };

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Serve frontend files
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, '..', 'frontend', 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Ficheiro não encontrado');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (req.url.endsWith('.css')) {
    const filePath = path.join(__dirname, '..', 'frontend', req.url);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Ficheiro não encontrado');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(data);
    });
    return;
  }

  if (req.url.endsWith('.js') && !req.url.startsWith('/api')) {
    const filePath = path.join(__dirname, '..', 'frontend', req.url);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Ficheiro não encontrado');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }


  if (req.method === 'POST' && req.url === '/api/process') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const payload = buildPayload(parsed.message || '');
        const user = parsed.user;

        const config = USER_EXCEL_MAP[user];
        if (!config) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User inválido.' }));
          return;
        }

        // Se o output ainda não existe, cria a partir do template deste user
        if (!fs.existsSync(config.output)) {
          fs.copyFileSync(config.template, config.output);
        }

        addPayloadToExcel(payload, config.output, {
          startRow: config.startRow,
          col: { cliente: 'A', data: 'B', valor: 'C' }
        }).then(() => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(payload));
        }).catch((err) => {
          console.error('Erro ao escrever no Excel:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Erro ao processar o Excel.', error: err.message }));
        });
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Pedido inválido.' }));
      }
    });

    return;
  }

 if (req.method === 'POST' && req.url === '/api/newfile') {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

 req.on('end', () => {
    console.log('>>> 1. pedido recebido, body:', body);
    try {
      const parsed = JSON.parse(body);
      console.log('>>> 2. JSON parseado:', parsed);
      const payload = buildPayload(parsed.message || '');
      console.log('>>> 3. payload construído:', payload);
      const user = parsed.user;

      const config = USER_EXCEL_MAP[user];
      if (!config) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User inválido.' }));
        return;
      }

      if (!fs.existsSync(config.output)) {
        fs.copyFileSync(config.template, config.output);
      }
      console.log('>>> 4. antes de chamar addPayloadToExcel');

      addPayloadToExcel(payload, config.output, {
        startRow: 20,
        col: { cliente: 'A', data: 'B', valor: 'C' }
      }).then(() => {
        console.log('>>> 7. sucesso, a responder');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
      }).catch((err) => {
        console.error('>>> ERRO:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Erro ao processar o Excel.', error: err.message }));
      });
    } catch (error) {
      console.error('>>> ERRO SÍNCRONO:', error);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Pedido inválido.' }));
    }
  });

  return;
}

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Rota não encontrada.' }));
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
