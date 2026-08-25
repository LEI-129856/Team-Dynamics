const messageInput = document.getElementById('messageInput');
const processButton = document.getElementById('processButton');
const resultBox = document.getElementById('resultBox');
const userSelect = document.getElementById('messageTypeDropdown');
const newFileButton = document.getElementById('NewFile');
const cleanButton = document.getElementById('CleanMessage');

newFileButton.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/newfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user: userSelect.value })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao criar novo ficheiro.');
    }

    resultBox.textContent = 'Novo ficheiro criado com sucesso!';
  } catch (error) {
    resultBox.textContent = error.message || 'Ocorreu um erro.';
  }
});

processButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();

  // Verifica se a mensagem está vazia
  if (!message) {
    resultBox.textContent = 'Por favor, insere uma mensagem.';
    return;
  }

  resultBox.textContent = 'A processar...';

  try {
    // Envia a mensagem para o backend
    const response = await fetch('http://localhost:3000/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // Envia a mensagem como JSON
      body: JSON.stringify({
        message: message,
        user: userSelect.value // Passa o user selecionado
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao processar a mensagem.');
    }

    // Exibe o resultado no resultBox
    resultBox.innerHTML = `
    <div><strong>Cliente:</strong> ${data.cliente}</div>
    <div><strong>Atividade:</strong> ${data.atividade}</div>
    <div><strong>Data:</strong> ${data.data}</div>
    <div><strong>Valor:</strong> ${data.valor}</div>
    `;
  } catch (error) {
    resultBox.textContent = error.message || 'Ocorreu um erro.';
  }
});

cleanButton.addEventListener('click', () => { 
  messageInput.value = ""
  resultBox.textContent = "Aguardando mensagem..."
});
