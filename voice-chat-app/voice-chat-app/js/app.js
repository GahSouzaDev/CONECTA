class VoiceChatApp {
    constructor() {
        this.ws = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.roomId = null;
        this.username = null;
        this.isMuted = false;
        this.isDeafened = false;
        this.connectedUsers = new Map();
        this.messages = [];
        
        // Configuração WebRTC
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadUserSettings();
        this.showWelcomeScreen();
    }
    
    setupEventListeners() {
        // Botões da tela de boas-vindas
        document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('room-id-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        
        // Controles de áudio
        document.getElementById('mute-btn').addEventListener('click', () => this.toggleMute());
        document.getElementById('deafen-btn').addEventListener('click', () => this.toggleDeafen());
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        document.getElementById('leave-room-btn').addEventListener('click', () => this.leaveRoom());
        
        // Chat de texto
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('send-message-btn').addEventListener('click', () => this.sendMessage());
        
        // Modal de configurações
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('copy-room-id').addEventListener('click', () => this.copyRoomId());
        
        // Controles de volume
        document.getElementById('mic-volume').addEventListener('input', (e) => this.updateMicVolume(e.target.value));
        document.getElementById('speaker-volume').addEventListener('input', (e) => this.updateSpeakerVolume(e.target.value));
        document.getElementById('username').addEventListener('input', (e) => this.updateUsername(e.target.value));
        
        // Fechar modal clicando fora
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') this.closeSettings();
        });
    }
    
    loadUserSettings() {
        this.username = localStorage.getItem('voicechat-username') || this.generateRandomUsername();
        document.getElementById('username').value = this.username;
        
        const micVolume = localStorage.getItem('voicechat-mic-volume') || '50';
        const speakerVolume = localStorage.getItem('voicechat-speaker-volume') || '50';
        
        document.getElementById('mic-volume').value = micVolume;
        document.getElementById('speaker-volume').value = speakerVolume;
        document.getElementById('mic-volume-value').textContent = micVolume + '%';
        document.getElementById('speaker-volume-value').textContent = speakerVolume + '%';
    }
    
    generateRandomUsername() {
        const adjectives = ['Rápido', 'Ninja', 'Pro', 'Elite', 'Master', 'Épico', 'Lendário', 'Supremo'];
        const nouns = ['Gamer', 'Player', 'Warrior', 'Hunter', 'Sniper', 'Mage', 'Knight', 'Assassin'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 1000);
        return `${adj}${noun}${num}`;
    }
    
    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.add('active');
        document.getElementById('chat-screen').classList.remove('active');
    }
    
    showChatScreen() {
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('chat-screen').classList.add('active');
    }
    
    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
    
    createRoom() {
        this.roomId = this.generateRoomId();
        this.connectToRoom();
    }
    
    joinRoom() {
        const roomIdInput = document.getElementById('room-id-input');
        const roomId = roomIdInput.value.trim().toUpperCase();
        
        if (!roomId) {
            this.showNotification('Por favor, digite o ID da sala', 'error');
            return;
        }
        
        if (roomId.length !== 6) {
            this.showNotification('O ID da sala deve ter 6 caracteres', 'error');
            return;
        }
        
        this.roomId = roomId;
        this.connectToRoom();
    }
    
    generateRoomId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    connectToRoom() {
        this.showLoading(true);
        this.updateConnectionStatus('Conectando...', false);
        
        // Conectar ao WebSocket - Para teste local, use ws://localhost:8080
        // Para produção, substitua pela URL do seu servidor
        const wsUrl = 'ws://localhost:8080';
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket conectado');
                this.joinWebSocketRoom();
            };
            
            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket desconectado');
                this.updateConnectionStatus('Desconectado', false);
                this.showNotification('Conexão perdida', 'error');
            };
            
            this.ws.onerror = (error) => {
                console.error('Erro WebSocket:', error);
                this.showLoading(false);
                this.showNotification('Erro ao conectar ao servidor. Certifique-se de que o servidor está rodando na porta 8080.', 'error');
            };
            
        } catch (error) {
            console.error('Erro ao conectar:', error);
            this.showLoading(false);
            this.showNotification('Erro ao conectar ao servidor', 'error');
        }
    }
    
    joinWebSocketRoom() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'join',
                roomId: this.roomId,
                username: this.username
            }));
        }
    }
    
    handleWebSocketMessage(data) {
        console.log('Mensagem recebida:', data);
        
        switch (data.type) {
            case 'start':
                this.handleRoomJoined(data);
                break;
            case 'offer':
                this.handleOffer(data);
                break;
            case 'answer':
                this.handleAnswer(data);
                break;
            case 'ice':
                this.handleIceCandidate(data);
                break;
            case 'message':
                this.handleTextMessage(data);
                break;
            case 'user-joined':
                this.handleUserJoined(data);
                break;
            case 'user-left':
                this.handleUserLeft(data);
                break;
        }
    }
    
    async handleRoomJoined(data) {
        console.log('Entrou na sala, player ID:', data.playerId);
        this.showLoading(false);
        this.showChatScreen();
        this.updateRoomInfo();
        this.updateConnectionStatus('Conectado', true);
        
        // Inicializar áudio
        await this.initializeAudio();
        
        // Se for o segundo player, iniciar chamada
        if (data.playerId === 1) {
            await this.createOffer();
        }
        
        this.addSystemMessage(`Conectado à sala ${this.roomId}`);
    }
    
    async initializeAudio() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            
            console.log('Áudio inicializado');
            this.setupPeerConnection();
            
        } catch (error) {
            console.error('Erro ao acessar microfone:', error);
            this.showNotification('Erro ao acessar o microfone', 'error');
        }
    }
    
    setupPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Adicionar stream local
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // Receber stream remoto
        this.peerConnection.ontrack = (event) => {
            console.log('Stream remoto recebido');
            this.remoteStream = event.streams[0];
            this.playRemoteAudio();
        };
        
        // Candidatos ICE
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate && this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'ice',
                    candidate: event.candidate
                }));
            }
        };
        
        // Estado da conexão
        this.peerConnection.onconnectionstatechange = () => {
            console.log('Estado da conexão:', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                this.updateConnectionStatus('Conectado - Áudio ativo', true);
            }
        };
    }
    
    async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);
            
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'offer',
                    offer: offer
                }));
            }
        } catch (error) {
            console.error('Erro ao criar oferta:', error);
        }
    }
    
    async handleOffer(data) {
        try {
            await this.peerConnection.setRemoteDescription(data.offer);
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            
            if (this.ws) {
                this.ws.send(JSON.stringify({
                    type: 'answer',
                    answer: answer
                }));
            }
        } catch (error) {
            console.error('Erro ao processar oferta:', error);
        }
    }
    
    async handleAnswer(data) {
        try {
            await this.peerConnection.setRemoteDescription(data.answer);
        } catch (error) {
            console.error('Erro ao processar resposta:', error);
        }
    }
    
    async handleIceCandidate(data) {
        try {
            await this.peerConnection.addIceCandidate(data.candidate);
        } catch (error) {
            console.error('Erro ao adicionar candidato ICE:', error);
        }
    }
    
    playRemoteAudio() {
        const audioElement = document.createElement('audio');
        audioElement.srcObject = this.remoteStream;
        audioElement.autoplay = true;
        audioElement.volume = document.getElementById('speaker-volume').value / 100;
        document.body.appendChild(audioElement);
    }
    
    sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'message',
                text: message,
                username: this.username,
                timestamp: Date.now()
            }));
            
            this.addMessage(this.username, message, Date.now(), true);
            input.value = '';
        } else {
            this.showNotification('Não conectado ao servidor', 'error');
        }
    }
    
    handleTextMessage(data) {
        this.addMessage(data.username, data.text, data.timestamp, false);
    }
    
    addMessage(username, text, timestamp, isOwn = false) {
        const container = document.getElementById('messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        
        const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const avatar = username.charAt(0).toUpperCase();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${username}</span>
                    <span class="message-timestamp">${time}</span>
                </div>
                <div class="message-text">${this.escapeHtml(text)}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    addSystemMessage(text) {
        const container = document.getElementById('messages-container');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'welcome-message';
        messageDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>${text}</p>
        `;
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('mute-btn');
        const icon = btn.querySelector('i');
        
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !this.isMuted;
            });
        }
        
        if (this.isMuted) {
            btn.classList.add('muted');
            icon.className = 'fas fa-microphone-slash';
            btn.title = 'Desmutar';
        } else {
            btn.classList.remove('muted');
            icon.className = 'fas fa-microphone';
            btn.title = 'Mutar';
        }
    }
    
    toggleDeafen() {
        this.isDeafened = !this.isDeafened;
        const btn = document.getElementById('deafen-btn');
        const icon = btn.querySelector('i');
        
        // Controlar volume dos elementos de áudio
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = this.isDeafened ? 0 : (document.getElementById('speaker-volume').value / 100);
        });
        
        if (this.isDeafened) {
            btn.classList.add('muted');
            icon.className = 'fas fa-volume-mute';
            btn.title = 'Ouvir';
        } else {
            btn.classList.remove('muted');
            icon.className = 'fas fa-volume-up';
            btn.title = 'Ensurdecer';
        }
    }
    
    openSettings() {
        document.getElementById('settings-modal').classList.add('active');
    }
    
    closeSettings() {
        document.getElementById('settings-modal').classList.remove('active');
    }
    
    copyRoomId() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.roomId).then(() => {
                this.showNotification('ID da sala copiado!', 'success');
            });
        } else {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = this.roomId;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('ID da sala copiado!', 'success');
        }
    }
    
    updateMicVolume(value) {
        document.getElementById('mic-volume-value').textContent = value + '%';
        localStorage.setItem('voicechat-mic-volume', value);
        
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                // Nota: O controle de volume do microfone é limitado na API WebRTC
                // Esta é uma implementação básica
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(this.localStream);
                const gainNode = audioContext.createGain();
                gainNode.gain.value = value / 100;
                source.connect(gainNode);
            });
        }
    }
    
    updateSpeakerVolume(value) {
        document.getElementById('speaker-volume-value').textContent = value + '%';
        localStorage.setItem('voicechat-speaker-volume', value);
        
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.volume = this.isDeafened ? 0 : (value / 100);
        });
    }
    
    updateUsername(value) {
        this.username = value || this.generateRandomUsername();
        localStorage.setItem('voicechat-username', this.username);
    }
    
    updateRoomInfo() {
        document.getElementById('room-id-display').textContent = this.roomId;
    }
    
    updateConnectionStatus(text, connected) {
        document.getElementById('connection-text').textContent = text;
        const indicator = document.getElementById('connection-indicator');
        
        if (connected) {
            indicator.classList.add('connected');
        } else {
            indicator.classList.remove('connected');
        }
    }
    
    leaveRoom() {
        if (this.ws) {
            this.ws.close();
        }
        
        if (this.peerConnection) {
            this.peerConnection.close();
        }
        
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        // Limpar elementos de áudio
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => audio.remove());
        
        this.resetState();
        this.showWelcomeScreen();
    }
    
    resetState() {
        this.ws = null;
        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
        this.roomId = null;
        this.isMuted = false;
        this.isDeafened = false;
        this.connectedUsers.clear();
        
        // Resetar UI
        document.getElementById('room-id-input').value = '';
        document.getElementById('message-input').value = '';
        document.getElementById('messages-container').innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-info-circle"></i>
                <p>Bem-vindo ao chat! Você pode conversar por texto e voz com seus amigos.</p>
            </div>
        `;
        
        // Resetar botões
        const muteBtn = document.getElementById('mute-btn');
        const deafenBtn = document.getElementById('deafen-btn');
        
        muteBtn.classList.remove('muted');
        muteBtn.querySelector('i').className = 'fas fa-microphone';
        muteBtn.title = 'Mutar';
        
        deafenBtn.classList.remove('muted');
        deafenBtn.querySelector('i').className = 'fas fa-volume-up';
        deafenBtn.title = 'Ensurdecer';
    }
    
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f04747' : type === 'success' ? '#43b581' : '#5865f2'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 3000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    new VoiceChatApp();
});

