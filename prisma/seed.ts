// Sistema multi-tenant: cada Usuario se cadastra via /registrar.
// Não há mais um usuário placeholder a semear — este script fica vazio de propósito,
// mantido apenas para o caso de precisarmos de dados de exemplo no futuro.
async function main() {}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
