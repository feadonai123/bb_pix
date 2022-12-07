#Features disponiveis:
- Criar cobrança PIX QRCode
- Atualizar cobrança
- Consultar status PIX (pendente, pago, cancelado...)
- Consultar lista de PIXs pagos (informa o intervalo de tempo e retorna tds os PIXs pagos)

###Exemplo de uso:


```js
import Pix from "./src/index.js";

(async () => {
  const 
    pixDriver = new Pix({ ambiente: "dev" }),
    cobrancaExample = {
      calendario: {
        expiracao: 36000,
      },
      devedor: {
        cpf: "12345678909",
        nome: "Francisco da Silva",
      },
      valor: {
        original: "1.45",
      },
      chave: "7f6844d0-de89-47e5-9ef7-e0a35a681615",
      solicitacaoPagador: "Cobrança dos serviços prestados.",
    },
    cobrancaCriada = await pixDriver.criarCobrancaQRCODE(cobrancaExample),
    cobrancaAtualizada = await pixDriver.atualizarCobranca(cobrancaCriada.txid, { solicitacaoPagador: "ALTERADO" }),
    consultarCobrancaCriada = await pixDriver.consultarCobrancaPorTxid(cobrancaAtualizada.txid)

  await pixDriver.simularPagamento(cobrancaCriada.textoImagemQRcode)

  const 
    pixRecebidos = await pixDriver.consultarPixRecebidos("2022-12-06T12:39:17.102Z", "2022-12-09T12:39:17.102Z"),
    consultarCobrancaPaga = await pixDriver.consultarCobrancaPorTxid(pixRecebidos.pix[0].txid)
})();
```
