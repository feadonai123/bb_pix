import * as dotenv from "dotenv";
dotenv.config();
import Pix from "./src/index.js";

(async () => {
  const pixDriver = new Pix({
    ambiente: "dev",
    appKey: process.env.DEVELOPER_APPLICATION_KEY,
    clientBasic: process.env.CLIENT_BASIC,
  });

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
    chave: process.env.CHAVE_PIX,
    solicitacaoPagador: "Cobrança dos serviços prestados.",
  }

  try{
    //const criarCobranca = await pixDriver.criarCobranca(cobrancaExample)
    const 
      cobrancaCriada = await pixDriver.criarCobrancaQRCODE(cobrancaExample),
      cobrancaAtualizada = await pixDriver.atualizarCobranca(cobrancaCriada.txid, { solicitacaoPagador: "ALTERADO" }),
      consultarCobrancaCriada = await pixDriver.consultarCobrancaPorTxid(cobrancaAtualizada.txid)
    console.log({
      cobrancaCriada,
      cobrancaAtualizada,
      consultarCobrancaCriada,
    })

    //await pixDriver.simularPagamento(cobrancaCriada.textoImagemQRcode)

    console.log('\n\n\n')
    const 
      pixRecebidos = await pixDriver.consultarPixRecebidos("2022-09-19T12:39:17.102Z", "2022-09-23T12:39:17.102Z"),
      consultarCobrancaPaga = await pixDriver.consultarCobrancaPorTxid(pixRecebidos.pix[0].txid),
      consultarPix = await pixDriver.consultarPixPorE2EId(pixRecebidos.pix[0].endToEndId)
    console.log({
      pixRecebidos,
      consultarCobrancaPaga,
      consultarPix,
    })
  }catch(e){
    console.log("ERRO", e)
  }
})();
