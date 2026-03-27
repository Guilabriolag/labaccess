/* ============================================================
   LabAccess · Sistema de Controle de Acesso
   labaccess.js — Lógica da aplicação com sistema de abas
   ============================================================ */

// ── Estado Global ─────────────────────────────────────────
let selectedColor = '#ffd700';
let selectedQty   = 60;
let selectedPrice = 79;
let isPaid        = false;
let qrGenerated   = false;
let currentQRContent = '';

// ── Sistema de Abas ─────────────────────────────────────────
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Remove active class de todos os botões e panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Adiciona active no botão e pane atual
            btn.classList.add('active');
            const activePane = document.getElementById(tabId);
            if (activePane) activePane.classList.add('active');
        });
    });
}

// ── Cor do crachá ─────────────────────────────────────────
function setColor(color) {
    selectedColor = color;
    const crachaElement = document.getElementById('crachá');
    if (crachaElement) {
        crachaElement.style.setProperty('--accent', color);
    }

    document.querySelectorAll('.color-swatch').forEach(el => {
        el.classList.toggle('active', el.dataset.color === color);
    });
}

// ── Preview em tempo real ──────────────────────────────────
function updatePreview() {
    const get     = id => document.getElementById(id);
    const checked = id => get(id)?.checked || false;
    const val     = id => get(id)?.value || '';

    // Visibilidade de campos
    const showNome        = checked('show_nome');
    const showEmpresa     = checked('show_empresa');
    const showCargo       = checked('show_cargo');
    const showMatricula   = checked('show_matricula');
    const showDepartamento= checked('show_departamento');
    const showPerfil      = checked('show_perfil');
    const showValidade    = checked('show_validade');
    const showFoto        = checked('show_foto');
    const showSite        = checked('show_site');
    const showLinkedin    = checked('show_linkedin');
    const showInstagram   = checked('show_instagram');
    const showWhatsapp    = checked('show_whatsapp');
    const showEmail       = checked('show_email');

    // Valores dos campos
    const nome         = val('nome')         || '—';
    const empresa      = val('empresa')      || '—';
    const cargo        = val('cargo')        || '—';
    const matricula    = val('matricula')    || '—';
    const departamento = val('departamento') || '—';
    const perfil       = val('perfil');
    const validade     = val('validade');
    const fotoUrl      = val('foto_url');
    const site         = val('site');
    const linkedin     = val('linkedin');
    const instagram    = val('instagram');
    const whatsapp     = val('whatsapp');
    const email        = val('email');

    // Atualiza textos do crachá
    const previewNome = document.getElementById('previewNome');
    const previewEmpresa = document.getElementById('previewEmpresa');
    const previewCargo = document.getElementById('previewCargo');
    
    if (previewNome) previewNome.innerText = showNome ? nome : '••••••••';
    if (previewEmpresa) previewEmpresa.innerText = showEmpresa ? empresa : '••••';
    if (previewCargo) previewCargo.innerText = showCargo ? cargo : '';

    // Detalhes (matrícula, depto, perfil)
    const detailsContainer = document.getElementById('detailsContainer');
    if (detailsContainer) {
        detailsContainer.innerHTML = '';
        const details = [];
        if (showMatricula)    details.push({ label: 'ID',     value: matricula });
        if (showDepartamento) details.push({ label: 'Depto',  value: departamento });
        if (showPerfil)       details.push({ label: 'Perfil', value: perfil });

        details.forEach(d => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            div.innerHTML = `<div class="detail-label">${d.label}</div><div class="detail-value">${d.value}</div>`;
            detailsContainer.appendChild(div);
        });
    }

    // Links sociais
    const socialContainer = document.getElementById('socialContainer');
    if (socialContainer) {
        socialContainer.innerHTML = '';
        const socials = [];
        if (showSite && site)      socials.push({ icon: '🌐', url: site, label: 'Site' });
        if (showLinkedin && linkedin)  socials.push({ icon: '💼', url: linkedin, label: 'LinkedIn' });
        if (showInstagram && instagram) socials.push({ icon: '📷', url: `https://instagram.com/${instagram.replace('@','')}`, label: 'Instagram' });
        if (showWhatsapp && whatsapp)  socials.push({ icon: '📱', url: `https://wa.me/55${whatsapp.replace(/\D/g,'')}`, label: 'WhatsApp' });
        if (showEmail && email)     socials.push({ icon: '✉️', url: `mailto:${email}`, label: 'Email' });

        socials.forEach(s => {
            const a = document.createElement('a');
            a.href = s.url;
            a.target = '_blank';
            a.className = 'social-link';
            a.innerHTML = `${s.icon} ${s.label}`;
            socialContainer.appendChild(a);
        });
    }

    // Validade
    const previewValidade = document.getElementById('previewValidade');
    if (previewValidade) {
        const dataFormatada = validade
            ? new Date(validade).toLocaleDateString('pt-BR')
            : '--/--/----';
        previewValidade.innerText = showValidade ? dataFormatada : '••••••';
    }

    // Foto
    const header = document.querySelector('.crachá-header');
    let fotoElement = document.querySelector('.crachá-photo');
    
    if (showFoto && fotoUrl && header && !fotoElement) {
        const img = document.createElement('img');
        img.className = 'crachá-photo';
        img.src = fotoUrl;
        header.appendChild(img);
    } else if (fotoElement && (!showFoto || !fotoUrl)) {
        fotoElement.remove();
    } else if (fotoElement && showFoto && fotoUrl) {
        fotoElement.src = fotoUrl;
    }
}

// ── Geração do QR Code ────────────────────────────────────
function generateQRCode(text, canvasId) {
    return new Promise((resolve, reject) => {
        const canvas = document.getElementById(canvasId);
        if (!canvas) { reject(new Error('Canvas não encontrado')); return; }

        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(text)}`;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('Erro ao gerar QR Code'));
        img.src = qrUrl;
    });
}

// ── Conteúdo do QR ────────────────────────────────────────
function generateQRContent() {
    const val = id => document.getElementById(id)?.value || '';
    const data = {
        tipo:        'labaccess_demo_v1',
        id:          Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        empresa:     val('empresa')     || 'Empresa',
        nome:        val('nome')        || 'Colaborador',
        cargo:       val('cargo')       || 'Cargo',
        matricula:   val('matricula')   || 'ID',
        departamento:val('departamento')|| 'Depto',
        perfil:      val('perfil'),
        validade:    val('validade'),
        site:        val('site'),
        linkedin:    val('linkedin'),
        instagram:   val('instagram'),
        whatsapp:    val('whatsapp'),
        email:       val('email'),
        observacoes: val('observacoes'),
        timestamp:   new Date().toISOString(),
        demo_version: true
    };

    // Checksum simples
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    data.checksum = Math.abs(hash).toString(36);
    return JSON.stringify(data);
}

// ── Gerar crachá ──────────────────────────────────────────
async function generateBadge() {
    const content = generateQRContent();
    currentQRContent = content;

    const placeholder = document.getElementById('qrPlaceholder');
    const canvas = document.getElementById('qrCanvas');

    if (placeholder) placeholder.style.display = 'flex';
    if (canvas) canvas.style.display = 'none';

    try {
        await generateQRCode(content, 'qrCanvas');
        if (placeholder) placeholder.style.display = 'none';
        if (canvas) canvas.style.display = 'block';
        qrGenerated = true;

        const paymentBtn = document.getElementById('paymentBtn');
        if (paymentBtn) {
            paymentBtn.disabled = false;
            paymentBtn.innerText = `💳 SIMULAR PAGAMENTO R$ ${selectedPrice},00`;
        }

        showToast('✅ QR Code gerado! Agora simule o pagamento.', 'success');
    } catch (e) {
        console.error('Erro ao gerar QR:', e);
        showToast('Erro ao gerar QR Code. Tente novamente.', 'error');
    }
}

// ── Pagamento / Modal ─────────────────────────────────────
function handlePayment() {
    if (!qrGenerated) {
        showToast('⚠️ Gere o QR Code primeiro!', 'warning');
        return;
    }
    openModal();
}

function openModal() {
    const modal = document.getElementById('paymentModal');
    const modalTotal = document.getElementById('modalTotal');
    if (modalTotal) modalTotal.innerText = `R$ ${selectedPrice},00`;

    const qrDiv = document.getElementById('modalQr');
    if (qrDiv) {
        qrDiv.innerHTML = '';
        
        const pixString = `00020126580014br.gov.bcb.pix0136contato@labriolag.com.br5204000053039865404${selectedPrice * 100}5802BR5925Labriolag Holding6009SAO PAULO62260522LabAccess_${Date.now()}6304`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(pixString)}`;

        const img = document.createElement('img');
        img.src = qrUrl;
        img.style.cssText = 'width:160px;height:160px;';
        qrDiv.appendChild(img);
    }

    if (modal) modal.classList.add('open');
}

function closeModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) modal.classList.remove('open');
}

function simulatePayment() {
    isPaid = true;
    closeModal();
    downloadBadge();

    // Salva registro local
    const empresa = document.getElementById('empresa')?.value || '';
    const nome = document.getElementById('nome')?.value || '';
    
    const venda = {
        data:        new Date().toISOString(),
        empresa:     empresa,
        quantidade:  selectedQty,
        total:       selectedPrice,
        colaborador: nome,
        demo_version: true
    };
    
    try {
        const vendas = JSON.parse(localStorage.getItem('labaccess_vendas') || '[]');
        vendas.unshift(venda);
        localStorage.setItem('labaccess_vendas', JSON.stringify(vendas.slice(0, 50)));
    } catch (e) {
        console.error('Erro ao salvar registro:', e);
    }
}

// ── Download do crachá ────────────────────────────────────
async function downloadBadge() {
    if (!isPaid) {
        showToast('⚠️ Simule o pagamento primeiro!', 'warning');
        return;
    }

    const crachaElement = document.getElementById('crachá');
    if (!crachaElement) return;

    try {
        showToast('📸 Gerando imagem do crachá...', 'info');
        const canvas = await html2canvas(crachaElement, {
            scale: 3,
            backgroundColor: null,
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const nome = document.getElementById('nome')?.value || 'crachá';
        const empresa = document.getElementById('empresa')?.value || 'empresa';
        link.download = `LabAccess_Demo_${empresa}_${nome}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        showToast('✅ Crachá baixado! Versão demonstrativa.', 'success');
    } catch (e) {
        console.error(e);
        showToast('Erro ao gerar imagem', 'error');
    }
}

// ── Toast de notificação ──────────────────────────────────
function showToast(msg, type) {
    const colors = {
        success: '#10b981',
        error:   '#ef4444',
        warning: '#f59e0b',
        info:    '#1e90ff'
    };
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.background = colors[type] || colors.info;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── Inicialização ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa sistema de abas
    initTabs();

    // Define validade padrão = hoje + 1 ano
    const validadeInput = document.getElementById('validade');
    if (validadeInput) {
        const umAno = new Date();
        umAno.setFullYear(umAno.getFullYear() + 1);
        validadeInput.value = umAno.toISOString().split('T')[0];
    }

    // Seleção de plano
    document.querySelectorAll('.plan-card').forEach(plan => {
        plan.addEventListener('click', () => {
            document.querySelectorAll('.plan-card').forEach(p => p.classList.remove('selected'));
            plan.classList.add('selected');
            selectedQty = parseInt(plan.dataset.qty);
            selectedPrice = parseInt(plan.dataset.price);

            const totalValue = document.getElementById('totalValue');
            const qtyInfo = document.getElementById('qtyInfo');
            
            if (totalValue) totalValue.innerText = `R$ ${selectedPrice},00`;
            if (qtyInfo) {
                const precoUnit = (selectedPrice / selectedQty).toFixed(2);
                qtyInfo.innerText = `${selectedQty} acessos · R$ ${precoUnit} por acesso`;
            }
        });
    });

    // Seletor de cores com delegação de evento
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', () => setColor(swatch.dataset.color));
    });

    // Preview inicial
    updatePreview();

    // Restaura dados salvos
    const saved = localStorage.getItem('labaccess_empresa');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.empresa && document.getElementById('empresa')) {
                document.getElementById('empresa').value = data.empresa;
                updatePreview();
            }
        } catch (_) {}
    }

    // Salva empresa ao sair
    window.addEventListener('beforeunload', () => {
        const empresa = document.getElementById('empresa')?.value;
        if (empresa) localStorage.setItem('labaccess_empresa', JSON.stringify({ empresa }));
    });
});
