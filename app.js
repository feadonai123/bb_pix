import * as dotenv from "dotenv";
dotenv.config();
import Pix from "./src/services/pix.js";

(async () => {
  const pixDriver = new Pix("dev");

  const promiseCriarCobranca = pixDriver.criarCobranca({
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
  });

  
  const inicio = new Date().getTime() - 4 * 24 * 60 * 60 * 1000,
    fim = new Date().getTime(),
    isoInicio = new Date(inicio).toISOString(),
    isoFim = new Date(fim).toISOString(),
    promiseConsultarPix = pixDriver.consultarPix(isoInicio, isoFim);

  const [criarCobranca, consultarPix] = await Promise.all([
    promiseCriarCobranca,
    promiseConsultarPix,
  ]);

  console.log("\n\n\n");
  if (criarCobranca.success) {
    console.log("Cobrança criada com sucesso");
    console.log(criarCobranca.data);
  } else console.log("Erro ao criar cobrança", criarCobranca.data);

  
  console.log("\n\n\n");
  if (consultarPix.success) {
    console.log("Pix consultado com sucesso");
    console.log(consultarPix.data)
    const { parametros, pix } = consultarPix.data;
    const { txid, valor, horario, pagador, infoPagador, endToEndId } = pix[0];
    const { cpf, cnpj, nome } = pagador;
  } else console.log("Erro ao consultar pix", consultarPix.data);

})();
