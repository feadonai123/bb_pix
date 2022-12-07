import Pix from "./src/index.js";
import fs from "fs";

/*
  Para funcionamento do módulo, adicioanr as variáveis de ambiente abaixo no arquivo .env
  - CLIENT_BASIC
  - DEVELOPER_APPLICATION_KEY
*/

(async () => {
  const pixDriver = new Pix({
    ambiente: "dev"
  });

  let json = {}

  const cobrancaExample = {
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
  }

  try{
    const 
      cobrancaCriada = await pixDriver.criarCobrancaQRCODE(cobrancaExample),
      cobrancaAtualizada = await pixDriver.atualizarCobranca(cobrancaCriada.txid, { solicitacaoPagador: "ALTERADO" }),
      consultarCobrancaCriada = await pixDriver.consultarCobrancaPorTxid(cobrancaAtualizada.txid)

    json["cobrancaCriada"] = cobrancaCriada
    json["cobrancaAtualizada"] = cobrancaAtualizada
    json["consultarCobrancaCriada"] = consultarCobrancaCriada

    await pixDriver.simularPagamento(cobrancaCriada.textoImagemQRcode)

    const 
      pixRecebidos = await pixDriver.consultarPixRecebidos("2022-12-06T12:39:17.102Z", "2022-12-09T12:39:17.102Z"),
      consultarCobrancaPaga = await pixDriver.consultarCobrancaPorTxid(pixRecebidos.pix[0].txid)

    json["pixRecebidos"] = pixRecebidos
    json["consultarCobrancaPaga"] = consultarCobrancaPaga

    fs.writeFileSync('sample.json', JSON.stringify(json, null, 2))
  }catch(e){
    console.log("ERRO", e)
  }
})();
