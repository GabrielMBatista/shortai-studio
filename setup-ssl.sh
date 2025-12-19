#!/bin/bash

# Script para obter certificado SSL Let's Encrypt
# Execute no servidor: bash setup-ssl.sh

DOMAIN="srv1161960.hstgr.cloud"
EMAIL="your-email@example.com" # ALTERE PARA SEU EMAIL!

echo "🔒 Configurando SSL para $DOMAIN"

# 1. Instalar Certbot (se não tiver)
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot
fi

# 2. Parar container temporariamente (para liberar porta 80)
echo "⏸️  Parando container..."
cd /path/to/shortsai-studio # ALTERE PARA O PATH CORRETO!
docker-compose down

# 3. Obter certificado
echo "📜 Obtendo certificado..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --http-01-port=80

# 4. Verificar se funcionou
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificado obtido com sucesso!"
    
    # 5. Restartar container com SSL
    echo "🚀 Reiniciando container com HTTPS..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    echo ""
    echo "✅ HTTPS configurado! Acesse: https://$DOMAIN"
    echo ""
    echo "📝 Configurar renovação automática:"
    echo "   sudo crontab -e"
    echo "   Adicionar: 0 0 1 * * certbot renew --quiet && docker restart shortsai-studio"
else
    echo "❌ Falha ao obter certificado!"
    echo "Verifique se:"
    echo "  1. DNS aponta para este servidor"
    echo "  2. Porta 80 está aberta no firewall"
    echo "  3. Email está correto"
fi
