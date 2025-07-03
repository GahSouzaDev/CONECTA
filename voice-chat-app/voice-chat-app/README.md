# VoiceChat - Aplicação de Comunicação para Gamers

Uma aplicação de comunicação de voz e texto simples e eficiente, similar ao Discord, desenvolvida especificamente para uso entre amigos durante jogos.

## 🚀 Características

- **Comunicação por Voz**: WebRTC para comunicação de áudio em tempo real
- **Chat de Texto**: Sistema de mensagens instantâneas
- **Controles de Áudio**: Mutar/desmutar microfone e controlar volume
- **Interface Moderna**: Design inspirado no Discord com tema escuro
- **Salas Privadas**: Sistema de salas com IDs únicos de 6 caracteres
- **Responsivo**: Funciona em desktop e dispositivos móveis
- **Baixo Consumo**: Otimizado para não sobrecarregar o servidor

## 📋 Pré-requisitos

- Node.js (para executar o servidor)
- Navegador moderno com suporte a WebRTC
- Conexão com a internet

## 🛠️ Instalação e Configuração

### 1. Instalar Dependências do Servidor

```bash
cd voice-chat-app
npm install
```

### 2. Iniciar o Servidor WebSocket

```bash
npm start
```

O servidor será iniciado na porta 8080 (ou na porta definida pela variável de ambiente PORT).

### 3. Abrir a Aplicação

Abra o arquivo `index.html` em um navegador web ou configure um servidor HTTP local.

## 🎮 Como Usar

### Criando uma Sala

1. Clique em **"Criar Sala"** na tela inicial
2. Um ID único de 6 caracteres será gerado automaticamente
3. Compartilhe este ID com seus amigos para que possam se conectar

### Entrando em uma Sala

1. Digite o ID da sala de 6 caracteres no campo **"ID da Sala"**
2. Clique em **"Entrar"**
3. Aguarde a conexão ser estabelecida

### Controles de Áudio

- **Microfone**: Clique no ícone do microfone para mutar/desmutar
- **Alto-falantes**: Clique no ícone do alto-falante para ensurdecer/ouvir
- **Configurações**: Ajuste volumes e defina seu nome de usuário
- **Sair**: Clique no ícone de saída para deixar a sala

### Chat de Texto

- Digite sua mensagem no campo inferior
- Pressione **Enter** ou clique no botão de envio
- As mensagens aparecerão em tempo real para todos os usuários

## 🔧 Configuração do Servidor

### Para Uso Local

O servidor está configurado para rodar em `localhost:8080`. Para uso local, mantenha a configuração padrão.

### Para Uso em Produção

1. **Hospede o servidor** em um serviço como Heroku, DigitalOcean, etc.
2. **Atualize a URL** no arquivo `js/app.js`, linha 145:
   ```javascript
   const wsUrl = 'wss://seu-servidor.com';
   ```
3. **Configure HTTPS** para que o WebRTC funcione corretamente

## 📁 Estrutura do Projeto

```
voice-chat-app/
├── index.html          # Página principal da aplicação
├── css/
│   └── style.css       # Estilos da aplicação
├── js/
│   └── app.js          # Lógica principal da aplicação
├── server.js           # Servidor WebSocket
├── package.json        # Dependências do servidor
└── README.md           # Este arquivo
```

## 🌐 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, WebSocket (ws)
- **Comunicação**: WebRTC para áudio, WebSocket para sinalização
- **Design**: CSS Grid, Flexbox, Gradientes, Animações

## 🔒 Recursos de Segurança

- Salas privadas com IDs únicos
- Comunicação peer-to-peer (WebRTC)
- Sem armazenamento de dados pessoais
- Conexões temporárias (dados não persistem)

## 🎯 Funcionalidades Principais

### ✅ Implementado

- [x] Criação e entrada em salas
- [x] Comunicação de voz via WebRTC
- [x] Chat de texto em tempo real
- [x] Controles de áudio (mute/unmute)
- [x] Configurações de volume
- [x] Interface responsiva
- [x] Notificações do sistema
- [x] Indicadores de status de conexão

### 🔄 Possíveis Melhorias Futuras

- [ ] Suporte para mais de 2 usuários por sala
- [ ] Compartilhamento de tela
- [ ] Histórico de mensagens
- [ ] Salas persistentes
- [ ] Sistema de autenticação
- [ ] Moderação de salas

## 🐛 Solução de Problemas

### Erro de Conexão

- Verifique se o servidor está rodando na porta 8080
- Confirme se não há firewall bloqueando a conexão
- Para produção, certifique-se de usar HTTPS/WSS

### Áudio Não Funciona

- Permita acesso ao microfone quando solicitado pelo navegador
- Verifique se o microfone não está sendo usado por outro aplicativo
- Teste em um navegador diferente

### Interface Não Carrega

- Verifique se todos os arquivos estão no local correto
- Abra o console do navegador para verificar erros
- Certifique-se de que o CSS e JS estão sendo carregados

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique a seção de solução de problemas
2. Consulte o console do navegador para erros
3. Teste a conexão de rede

## 📄 Licença

Este projeto é de uso livre para fins pessoais e educacionais.

---

**Desenvolvido para proporcionar uma experiência de comunicação simples e eficiente para gamers! 🎮**

