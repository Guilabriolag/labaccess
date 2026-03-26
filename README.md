# ⚡ LabAccess: Sovereign Identity Protocol

**LabAccess** é a camada de identidade e provisionamento de acesso do ecossistema **Labriolag Holding**. Projetado sob a filosofia *Vanilla-First*, o sistema opera como um provedor de autenticação física e digital, eliminando a dependência de grandes provedores de nuvem e centralização de dados.

## 🛠️ A Arquitetura
O projeto é dividido em um núcleo soberano que permite a transmutação visual para diversos nichos de mercado (Skins), mantendo a integridade do protocolo de dados.

- **Frontend:** HTML5/CSS3 Puro, JavaScript Vanilla (Zero Frameworks).
- **Backend:** Node.js com SQLite (Portable Database).
- **Protocolo:** Assinatura de dados via Hash SHA-256 embutida em QR Codes.

## 📂 Estrutura do Ecossistema
- `/frontend/public`: Interface de emissão de "Access Chips" para o usuário final.
- `/frontend/admin`: Dashboard de gestão de acessos e monitoramento de vendas.
- `/backend`: Motor de regras, validação de transações Lightning e assinatura de tokens.

## 🎨 Camada de Skins (Multisector)
O LabAccess possui 12 skins pré-configuradas para adaptação instantânea de mercado:
1. **Academia** (High Energy)
2. **Condomínio** (Security Focus)
3. **Corporativo** (Institutional)
4. **Escola** (Educational)
... e mais 8 segmentos de mercado.

## 🔐 Segurança e Soberania
- **Offline-First:** O QR Code gerado contém os dados necessários para validação sem consulta obrigatória ao banco de dados em tempo real.
- **Pay-per-use:** Integração nativa com a rede **Bitcoin Lightning** (300 sats/registro).
- **Zero Tracker:** Nenhuma telemetria externa. Os dados pertencem ao controlador do laboratório.

---
### ⚙️ Instalação Rápida

1. Clone o repositório: `git clone https://github.com/seu-usuario/labaccess.git`
2. Entre na pasta do backend: `cd backend`
3. Instale as dependências: `npm install`
4. Inicie o servidor: `npm start`

---
> "Codificando a soberania, um acesso por vez."  
> **Labriolag Holding // Marketing & Technology Ecosystem**
