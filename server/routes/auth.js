const express = require('express');
const router = express.Router();
const socialMediaConfig = require('../config/socialMedia');
const User = require('../models/User');

// Rota para iniciar o processo de autenticação
router.get('/:platform', async (req, res) => {
  const { platform } = req.params;
  const { userId } = req.query; // Você precisará implementar autenticação de usuário
  const config = socialMediaConfig[platform];

  if (!config) {
    return res.status(400).json({ error: 'Plataforma não suportada' });
  }

  try {
    // Gerar estado único para segurança
    const state = Math.random().toString(36).substring(7);
    // Armazenar estado em sessão ou banco de dados
    
    const authUrl = generateAuthUrl(platform, config, state);
    res.json({ authUrl });
  } catch (error) {
    console.error(`Erro ao iniciar autenticação ${platform}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Callbacks para cada plataforma
router.get('/:platform/callback', async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query;
  const { userId } = req.query; // Você precisará implementar autenticação de usuário

  try {
    // Verificar estado para segurança
    
    // Trocar código por token de acesso
    const tokenData = await exchangeCodeForToken(platform, code);
    
    // Buscar informações do usuário/página da rede social
    const socialProfile = await fetchSocialProfile(platform, tokenData.accessToken);
    
    // Atualizar usuário com as novas credenciais
    await User.findByIdAndUpdate(userId, {
      [`socialAccounts.${platform}`]: {
        connected: true,
        accessToken: tokenData.accessToken,
        pageId: socialProfile.id,
        pageName: socialProfile.name,
      }
    });

    // Redirecionar de volta para o app com sucesso
    res.redirect('/?connected=true');
  } catch (error) {
    console.error(`Erro no callback ${platform}:`, error);
    res.redirect('/?error=auth_failed');
  }
});

function generateAuthUrl(platform, config, state) {
  const scopes = {
    instagram: ['instagram_basic', 'instagram_content_publish'],
    facebook: ['pages_manage_posts', 'pages_read_engagement'],
    twitter: ['tweet.write', 'tweet.read', 'users.read'],
    linkedin: ['w_member_social']
  };

  const urls = {
    instagram: `https://api.instagram.com/oauth/authorize`,
    facebook: `https://www.facebook.com/v12.0/dialog/oauth`,
    twitter: `https://twitter.com/i/oauth2/authorize`,
    linkedin: `https://www.linkedin.com/oauth/v2/authorization`
  };

  const baseUrl = urls[platform];
  const scope = scopes[platform].join(' ');

  return `${baseUrl}?client_id=${config.clientId}&redirect_uri=${config.redirectUri}&scope=${scope}&response_type=code&state=${state}`;
}

async function exchangeCodeForToken(platform, code) {
  // Implementar troca de código por token para cada plataforma
  return { accessToken: 'token_placeholder' };
}

async function fetchSocialProfile(platform, accessToken) {
  // Implementar busca de perfil para cada plataforma
  return { id: 'id_placeholder', name: 'name_placeholder' };
}

module.exports = router;
