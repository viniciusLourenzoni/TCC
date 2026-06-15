# Deploy em produção (AWS EC2 Ubuntu)

## O que o pacote faz

Um único comando, rodado do seu computador, envia o código pro servidor e lá:

1. Gera `.env` com senhas fortes aleatórias (Postgres e JWT) na primeira execução
2. Instala Docker se não existir
3. Sobe três containers: PostgreSQL, API NestJS (com migrações automáticas) e frontend (build do Vite servido por nginx interno)
4. Roda o seed inicial (admin, categorias, produtos demo) apenas na primeira instalação
5. Configura um site no nginx do host apontando para os containers (portas internas 3001 e 8080, nada exposto direto)
6. Emite certificado HTTPS gratuito via Let's Encrypt usando o domínio `SEU-IP.sslip.io` (sem precisar comprar domínio)

## Pré-requisitos

- Liberar as portas 80 e 443 no Security Group da instância EC2
- Ter a chave `.pem` no seu computador (`chmod 400 chave.pem`)

## Comando

```bash
./deploy/deploy.sh -i ~/caminho/chave.pem ubuntu@SEU_IP_PUBLICO
```

Ao final o script imprime as URLs:

- App: `https://SEU-IP-COM-TRACOS.sslip.io`
- Swagger: `https://.../api/docs`
- Login demo: `admin@pwavarejo.com` / `admin123` (troque a senha após o primeiro acesso)

## Atualizar depois de mudar o código

Rode o mesmo comando de novo. O rsync envia só o que mudou e o compose reconstrói.

## Observações

- O `.env` de produção fica apenas no servidor (`~/pwa-varejo/deploy/.env`), com permissão 600
- Se a porta 80 estiver ocupada por algo que não seja nginx, o script para e avisa em vez de derrubar o serviço
- O certificado renova sozinho (timer do certbot)
- sslip.io é um DNS público que resolve `1-2-3-4.sslip.io` para `1.2.3.4`; se o Let's Encrypt recusar por limite de emissão do dia, rode de novo mais tarde ou use um subdomínio seu
