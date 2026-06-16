import { type ReactNode } from "react";

export type ContratoData = {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  telefones: string;
  email: string;
  crlv: string;
  representante: string;
  cpf: string;
  telefonesRep: string;
};

// Campo preenchível: mostra o valor ou uma linha em branco pra completar à mão.
function Field({ value, min = "6rem" }: { value: string; min?: string }) {
  if (value) return <span className="font-medium">{value}</span>;
  return (
    <span
      className="inline-block border-b border-neutral-400 align-bottom"
      style={{ minWidth: min }}
    >
      &nbsp;
    </span>
  );
}

function Clause({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="mt-2 text-justify">
      <span className="font-semibold">{n}</span> {children}
    </p>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-5 text-[13px] font-bold uppercase tracking-wide">
      {children}
    </h2>
  );
}

// Contrato de Locação de Espaço — Grande Prêmio Brasil (13 e 14/06/2026).
// Texto fixo conforme o modelo da AAposta; identificação do expositor preenchida.
export function ContractDocument({ data }: { data: ContratoData }) {
  return (
    <div className="contract mx-auto bg-white text-[12px] leading-relaxed text-neutral-900">
      <h1 className="text-center text-sm font-bold uppercase">
        Contrato de Locação de Espaço para Evento
      </h1>

      <p className="mt-4 text-justify">
        <span className="font-semibold">LOCADORA/PROMOTORA:</span> AAposta
        Estratégia, Comunicação e Eventos LTDA, inscrita no CNPJ sob o nº
        97.521.647/0001-09, sediada na Rua Joaquim Murtinho, 756/302 – Santa
        Teresa – Rio de Janeiro – RJ, neste ato representada por sua sócia
        administradora, Ana Paula Lopes Gomes; e
      </p>
      <p className="mt-2 text-justify">
        <span className="font-semibold">LOCADOR/REALIZADOR:</span> Jockey Club
        Brasileiro, inscrito no CNPJ/MF sob o n. 33.621.756/0003-79, sediada na
        Praça Santos Dumont, 31 - Gávea – CEP: 22470-060, Rio de Janeiro, RJ;
      </p>

      <p className="mt-3 font-semibold">LOCATÁRIO/EXPOSITOR:</p>
      <div className="mt-1 space-y-0.5">
        <p>Razão Social: <Field value={data.razaoSocial} min="16rem" /></p>
        <p>Nome Fantasia: <Field value={data.nomeFantasia} min="16rem" /></p>
        <p>CNPJ: <Field value={data.cnpj} min="12rem" /></p>
        <p>Inscrição Estadual: <Field value={data.inscricaoEstadual} min="12rem" /></p>
        <p>Endereço: <Field value={data.endereco} min="18rem" /></p>
        <p>Bairro: <Field value={data.bairro} min="12rem" /></p>
        <p>Cidade: <Field value={data.cidade} min="12rem" /></p>
        <p>CEP: <Field value={data.cep} min="8rem" /></p>
        <p>Telefones: <Field value={data.telefones} min="12rem" /></p>
        <p>E-mail: <Field value={data.email} min="16rem" /></p>
        <p>CRLV do Truck: <Field value={data.crlv} min="12rem" /></p>
        <p>neste ato representado por: <Field value={data.representante} min="14rem" /></p>
        <p>CPF: <Field value={data.cpf} min="12rem" /></p>
        <p>Telefones: <Field value={data.telefonesRep} min="12rem" /></p>
      </div>

      <p className="mt-3 text-justify">
        As partes acima identificadas, têm entre si, como justo e acertado o
        presente contrato, mediante as condições adiante expostas.
      </p>

      <Heading>1. Do Objeto</Heading>
      <Clause n="1.1.">
        O objeto do presente contrato é locação de espaço para evento, a seguir
        identificados e especificados:
      </Clause>
      <p className="mt-2">
        O espaço para colocação de infraestrutura no{" "}
        <span className="font-semibold">
          Grande Prêmio Brasil 13 e 14/06/2026
        </span>
      </p>
      <div className="mt-1 space-y-0.5">
        <p>( ) Estande/Barraca de 1,80m x 0,90m com um ponto de energia 220V e um ponto de iluminação;</p>
        <p>( ) Truck com um ponto de energia 220V em área descoberta;</p>
        <p>( ) Bike com um ponto de energia 220V e um ponto de Iluminação;</p>
        <p>( ) Estande da empresa com ____ m de comprimento e _____ m de largura com um ponto de energia 220V e um ponto de iluminação</p>
      </div>
      <Clause n="1.2.">
        O LOCATÁRIO declara a necessidade de __________ KVA’s para a sua
        atividade.
      </Clause>
      <Clause n="1.3.">
        Caso o LOCATÁRIO não declare os KVA’s necessários neste item, estes
        serão cedidos de forma automática à quantidade padrão de 1 KVA e
        qualquer quantidade superior a esta poderá ser cobrada como consumo
        extra.
      </Clause>
      <Clause n="1.4.">
        Em caso de Truck ou Bike o tamanho veículo é de _______m de largura por
        _______m de comprimento contemplando o reboque e ou qualquer outra
        necessidade de espaço.
      </Clause>
      <Clause n="1.5.">
        Serão disponibilizadas as opções de ligações de energia, a seguir
        sinalizada de acordo com a opção adequada ao negócio do
        LOCATÁRIO/EXPOSITOR:
      </Clause>
      <div className="mt-1 space-y-0.5">
        <p>( ) 1 tomada padrão brasileiro de três pinos – 220 v</p>
        <p>( ) 1 steck 32 A – 2 fases mais terra – 220 v</p>
        <p>( ) 1 steck 63 A – 3 fases mais terra – 220 v</p>
        <p>( ) outros: ________________________________.</p>
        <p className="text-[11px]">(Enviar cópia juntamente com o contrato).</p>
      </div>

      <Heading>2. Do Evento</Heading>
      <Clause n="2.1.">
        Local do evento: Jockey Club Brasileiro - Praça Santos Dumont, 31.
        Gávea, nesta cidade.
      </Clause>
      <Clause n="2.2.">
        O evento acontecerá no dia, Grande Prêmio Brasil 13 e 14/06/2026 no
        horário das 12h às 20h.
      </Clause>

      <Heading>3. Da Apresentação</Heading>
      <Clause n="3.1.">
        O evento será denominado “Grande Prêmio Brasil” e será produzido pela
        AAposta, estratégia, comunicação e eventos Ltda, e Jockey Club
        Brasileiro ora LOCADORA/PROMOTORA
      </Clause>

      <Heading>4. Do Manual do Expositor</Heading>
      <Clause n="4.1.">
        Fica expresso que o LOCATÁRIO/EXPOSITOR deverá aderir e cumprir
        integralmente todas as condições da locação descritas no MANUAL DO
        EXPOSITOR, que é parte integrante do presente contrato, sem
        possibilidade de se escusar de responsabilidades por falta de
        conhecimento do mesmo.
      </Clause>

      <Heading>5. Das Obrigações da Locadora/Promotora</Heading>
      <Clause n="5.1.">
        A LOCADORA e o Jockey Club Brasileiro se obrigam a promover, organizar e
        realizar o evento acima evidenciado, a fim de cumprir integralmente as
        obrigações que lhe forem atribuídas por este instrumento.
      </Clause>
      <Clause n="5.2.">
        Cabe à AAposta, estratégia, comunicação e eventos Ltda, e o Jockey Club
        Brasileiro cuidar da legalização do evento junto aos órgãos públicos
        competentes, no que lhe compete como organizadora/promotora do DOMINGO
        NO JOCKEY.
      </Clause>
      <Clause n="5.3.">
        Compete à LOCADORA disponibilizar à área locada de cada expositor, nos
        termos assinalados no item 1.1 da cláusula 1, e pelo período
        estabelecido no item 7.1 da cláusula 7.
      </Clause>
      <Clause n="5.4.">
        Divulgar o evento em ações de comunicação, dentre as quais, mídia paga,
        redes sociais, por meio de assessoria de imprensa e de equipes de
        divulgação, de acordo ao plano de comunicação apresentado na proposta
        comercial.
      </Clause>
      <Clause n="5.5.">
        Fornecer energia elétrica no período de realização do evento, nos termos
        assinalados na cláusula 1., bem como pontos estratégicos de iluminação
        do evento.
      </Clause>
      <Clause n="5.6.">
        Disponibilizar banheiros, mesas e cadeiras, manter a limpeza na área
        comum do evento e dos sanitários, bem como manter ambulância, extintores
        e brigada de incêndio no local do evento.
      </Clause>
      <Clause n="5.7.">
        A AAposta, estratégia, comunicação e eventos Ltda, e Jockey Club
        Brasileiro manterão segurança no local do evento, não se
        responsabilizando por danos e prejuízos pessoais, ou a quaisquer
        produtos, incluindo furto, roubo e sabotagem, bem como nos casos e
        interrupção de fornecimento de água, energia elétrica ou sinistro de
        qualquer espécie.
      </Clause>
      <Clause n="5.8.">
        Cabe à AAposta, estratégia, comunicação e eventos Ltda, e Jockey Club
        Brasileiro exigirem o cumprimento do MANUAL DO EXPOSITOR, podendo
        determinar a suspensão das atividades do LOCATÁRIO/EXPOSITOR que não
        cumprir com os deveres e obrigações aqui avençadas.
      </Clause>
      <Clause n="5.10.">
        Compete à LOCADORA decidir sobre casos omissos neste instrumento.
      </Clause>

      <Heading>6. Das Obrigações do Locatário/Expositor</Heading>
      <Clause n="6.1.">
        Cumprir, rigorosamente, todas as obrigações contratuais assumidas, bem
        como todas as regras contidas no MANUAL DO EXPOSITOR, parte integrante
        do presente.
      </Clause>
      <Clause n="6.2.">
        Cabe ao EXPOSITOR providenciar o seu próprio seguro contra quaisquer
        riscos, em especial, com relação aos seus funcionários em serviço no
        evento, bem como relativamente ao espaço, bens, produtos, equipamentos e
        materiais expostos. A LOCADORA se desobriga de qualquer responsabilidade
        por danos e prejuízos pessoais, ou a quaisquer produtos, incluindo
        furto, roubo e sabotagem, bem como nos casos e interrupção de
        fornecimento de água, energia elétrica ou sinistro de qualquer espécie.
      </Clause>
      <Clause n="6.3.">
        O LOCATÁRIO ficará integralmente responsável pelo transporte, depósito,
        guarda, manutenção de seus equipamentos e materiais, seja antes, durante
        e após o evento, não se responsabilizando a AAposta, estratégia,
        comunicação e eventos Ltda, e Jockey Club Brasileiro pela guarda,
        manutenção e depósito de qualquer material ou equipamentos do Locatário.
      </Clause>
      <Clause n="6.4.">
        O EXPOSITOR não poderá ceder ou sublocar, total ou parcialmente, o espaço
        locado;
      </Clause>
      <Clause n="6.5.">
        É vedado ao EXPOSITOR manter pessoal fora dos limites de seu espaço
        distribuindo folhetos, cartões, brindes ou abordando visitantes, seja
        com que pretexto for.
      </Clause>
      <Clause n="6.6.">
        É proibido ao EXPOSITOR o depósito ou exposição de materiais perigosos,
        explosivos, insalubres ou poluentes, que de qualquer forma possam
        representar perigo para os outros expositores e/ou ao público em geral.
      </Clause>
      <Clause n="6.7.">
        A AAposta, estratégia, comunicação e eventos Ltda, e Jockey Club
        Brasileiro não se responsabilizam por quaisquer encargos financeiros e
        não se estabelece, por força do presente contrato, nenhum vínculo
        empregatício entre o LOCATÁRIO/EXPOSITOR e as pessoas utilizadas,
        empregados, subcontratado ou terceiro relacionado à LOCADORA, cabendo as
        partes toda e qualquer responsabilidade trabalhistas, securitárias,
        previdenciárias e fiscais, inclusive aquelas decorrentes de modificações
        na legislação em vigor, relativamente aos seus empregados e/ou
        subcontratados envolvidos na organização, montagem e execução do evento.
      </Clause>
      <Clause n="6.8.">
        É obrigatório e de responsabilidade exclusiva do EXPOSITOR manter em seu
        espaço um cilindro de extintor PQS4 kg, sempre devidamente carregado e
        dentro do prazo de validade, conforme exigência do Corpo de Bombeiros -
        RJ.
      </Clause>
      <Clause n="6.9.">
        A responsabilidade pela aquisição, operacionalização e funcionamento dos
        meios de pagamento, a exemplo de cartões de crédito e débito, é
        exclusiva do LOCATÁRIO.
      </Clause>
      <Clause n="6.10.">
        A responsabilidade pela obtenção das autorizações ou alvarás junto ao
        poder público, inclusive autorização de Funcionamento Provisório emitida
        pela Secretaria de Estado de Fazenda (SEFAZ) e a Licença Sanitária para
        Atividade Transitória (LSAT) emitida pela Instituto Municipal de
        Vigilância Sanitária, Vigilância de Zoonoses e de Inspeção Agropecuária –
        IVISARio, e ainda de outras eventuais autorizações dos Órgãos de
        Vigilância Sanitária, bem como do DETRAN, é exclusiva do LOCATÁRIO,
        eximindo a LOCADORA de quaisquer responsabilidades oriundas da omissão do
        LOCATÁRIO nesse sentido. A AAposta, estratégia, comunicação e eventos
        Ltda, e Jockey Club Brasileiro não se responsabilizam por nenhuma
        consequência, administrativa ou judicial, advinda da falta de
        legalização perante qualquer órgão público.
      </Clause>
      <Clause n="6.11.">
        O LOCATÁRIO responsabiliza-se civil e criminalmente pelos alimentos e
        bebidas vendidos no evento, ficando sob a sua integral responsabilidade
        as consequências decorrentes de eventual produto/alimento/bebida vendido
        que venha a ocasionar problemas de saúde aos consumidores.
      </Clause>
      <Clause n="6.12.">
        O LOCATÁRIO responsabiliza-se civil e penal nos casos de queda de
        painéis, material exposto no estande ou qualquer tipo de acidente que
        cause danos aos consumidores.
      </Clause>
      <Clause n="6.13.">
        O EXPOSITOR que não respeitar o espaço delimitado e/ou dividir o espaço
        com outras marcas, ficará impedido de participar do próximo evento, sem
        prejuízo de eventuais perdas e danos.
      </Clause>
      <Clause n="6.14.">
        O EXPOSITOR será responsável pela limpeza do seu espaço com lixeiras de
        pedais e pelo armazenamento do lixo da na área de trás de seu estande ou
        truck, em sacos para o recolhimento, que será realizado pela equipe de
        limpeza do evento.
      </Clause>
      <Clause n="6.15.">
        Cabe ao EXPOSITOR disponibilizar álcool gel 70%, tanto para o público
        quanto para uso de sua equipe, bem como lixeiras de pedal com sacos em
        seus espaços.
      </Clause>
      <Clause n="6.16.">
        É de responsabilidade do EXPOSITOR fornecer e exigir o uso de máscaras e
        luvas para sua equipe na manipulação de alimentos.
      </Clause>
      <Clause n="6.17.">
        A empresa poderá fazer a cenografia do espaço, de acordo com as regras de
        montagem contidas no MANUAL DO EXPOSITOR, que é parte integrante deste
        instrumento.
      </Clause>
      <Clause n="6.18.">
        O evento não disponibilizará sistema de água e esgoto, sendo o EXPOSITOR
        responsável por providenciar às suas expensas o necessário à
        higienização dos utensílios que serão utilizados e o descarte dos
        dejetos, dentro das normas de cunho sanitário e afins, não cabendo à
        LOCADORA qualquer responsabilidade;
      </Clause>
      <Clause n="6.19.">
        Só poderão operar no evento empresas que possuam sistema de água e esgoto
        que se adequem as normas de cunho sanitário e afins, não cabendo à
        LOCADORA qualquer responsabilidade.
      </Clause>
      <Clause n="6.20.">
        O LOCATÁRIO/ EXPOSITOR se obriga a manter durante todo o evento pelo
        menos um funcionário responsável pelo funcionamento do espaço, sendo
        proibida a sua desmontagem ou retirada antes do término do evento.
      </Clause>
      <Clause n="6.21.">
        É proibido deixar no espaço ou nas dependências do local em que será
        realizado o evento, quaisquer materiais ou equipamentos, após o período
        estipulado no item 9.3 da cláusula 9.
      </Clause>
      <Clause n="6.22.">
        Caso haja qualquer tratamento de dados pessoais realizado pelo EXPOSITOR,
        este deverá observar os dispositivos contidos na Lei Geral de Proteção de
        Dados Pessoais (LGPD), Lei nº 13.709/2018. Não havendo qualquer
        ingerência e/ou compartilhamento de dados entre o LOCATÁRIO/ EXPOSITOR e
        a LOCADORA/PROMOTORA, quanto às atividades do EXPOSITOR durante o evento,
        sendo de sua exclusiva responsabilidade o cumprimento de normas
        referentes à proteção de dados.
      </Clause>

      <Heading>7. Do Prazo</Heading>
      <Clause n="7.1.">
        O prazo da locação é de 02 (dois) dias, 13 e 14/06/2026 no horário das
        12h às 20h.
      </Clause>

      <Heading>8. Do Pagamento</Heading>
      <Clause n="8.1.">
        O valor do aluguel ajustado entre as partes, é de R$ 20% do faturamento
        bruto das vendas da operação no evento; acrescidos da disponibilização de
        vouchers, de acordo ao negócio do LOCATÁRIO/EXPOSITOR:
      </Clause>
      <div className="mt-1 space-y-0.5">
        <p>( ) Cervejas: 7 Vouchers de Chopp ou Cerveja</p>
        <p>( ) Alimentos: 7 Vouchers de Lanche com Bebida do cardápio</p>
        <p>( ) Doces: 7 Vouchers de Doces do cardápio</p>
      </div>
      <Clause n="8.2.">
        O valor acima ajustado será pago à LOCADORA, através de pagamento via pix
        ou depósito bancário, com data de vencimento para o dia 16/06/2026, após
        o envio dos relatórios de prestação de contas. Dados bancários para o
        pagamento: AAposta Estratégia, Comunicação e Eventos LTDA - CNPJ / PIX:
        97.521.647/0001-09 - Banco Inter (077) - Agência: 0001 - Conta: 3775090-9
      </Clause>
      <Clause n="8.3.">
        Caso o pagamento não seja feito em até o dia 17/06/26, a participação do
        locatário será suspensa para as próximas edições.
      </Clause>

      <Heading>9. Da Montagem e Desmontagem</Heading>
      <Clause n="9.1.">
        A montagem do espaço pelo EXPOSITOR com food truck, barraquinhas com
        grande estrutura de equipamentos, food bikes e outra qualquer estrutura
        de maior volume e logística será sexta, dia 12/06/2026 das 14h às 18h.
      </Clause>
      <Clause n="9.2.">
        Na abertura do evento, conforme horário descrito no item 2.3 da cláusula
        2, o EXPOSITOR deverá estar com o seu espaço com a operação, organização
        e cenografia prontas para receber o público.
      </Clause>
      <Clause n="9.3.">
        O LOCATÁRIO deverá desmontar e retirar seu truck, bike, estruturas e
        todos os materiais e produtos, ao final do último dia do evento
        (domingo), tendo o prazo de duas horas após o término do evento.
      </Clause>
      <Clause n="9.4.">
        O LOCATÁRIO concorda em isentar a LOCADORA de qualquer responsabilidade
        pelo depósito e guarda do veículo, arcando de forma exclusiva com
        eventuais danos ao seu automóvel, além de roubo ou furto.
      </Clause>
      <Clause n="9.5.">
        O LOCATÁRIO assume a responsabilidade do comprimento dos horários de
        montagem, desmontagem e reposição de estoque descritos nas cláusulas
        acima. Em caso de descumprimento incidirá multa de 10% do valor da
        participação por hora ou fração e podendo automaticamente excluído de
        novos processos seletivos para os eventos da AAposta.
      </Clause>

      <Heading>10. Do Cancelamento do Evento</Heading>
      <Clause n="10.1.">
        A LOCADORA poderá, a seu exclusivo critério, cancelar o evento em virtude
        da falta de adesão de participantes necessária à viabilidade econômica do
        evento, inadimplência dos pagamentos contratuais dos expositores, casos
        fortuitos ou de força maior, sem que haja qualquer responsabilização, até
        10 dias antes das datas programadas, independentemente de comunicação
        prévia, cabendo apenas a devolução dos valores efetivamente pagos pelo
        LOCATÁRIO.
      </Clause>
      <Clause n="10.2.">
        Nenhuma das partes será responsável ou será considerada faltosa pelo
        descumprimento de qualquer cláusula deste contrato, se impedida de
        desempenhar suas obrigações por motivos de força maior ou caso fortuito,
        incluindo, mas não se limitando, a greves, incêndios, enchentes,
        terremotos, guerras ou outras contingências, além da previsão ou controle
        das partes.
      </Clause>
      <Clause n="10.3.">
        Acordam as partes que em caso de chuva o evento não será cancelado
      </Clause>

      <Heading>11. Da Rescisão</Heading>
      <Clause n="11.1.">
        O descumprimento das regras, disposições e obrigações estabelecidas neste
        instrumento, importará na rescisão automática deste contrato, sem
        prejuízo de eventuais perdas e danos.
      </Clause>
      <Clause n="11.2.">
        Na hipótese de não realização do evento, ou, em sendo realizado em data,
        local e horários diversos, o LOCATÁRIO poderá, a seu exclusivo critério,
        rescindir o presente contrato.
      </Clause>

      <Heading>12. Da Desistência</Heading>
      <Clause n="12.1.">
        A responsabilidade pela desistência do evento é exclusivamente do
        LOCATÁRIO.
      </Clause>
      <Clause n="12.2.">
        Após a confirmação de participação do evento, qualquer desistência, mesmo
        sem a assinatura do contrato, a empresa confirmada poderá ser excluída de
        novos processos seletivos para os eventos da LOCADORA.
      </Clause>

      <Heading>13. Das Disposições Gerais</Heading>
      <Clause n="13.1.">
        É expressamente proibido o trabalho de menores de idade no evento.
      </Clause>
      <Clause n="13.2.">
        O MANUAL DO EXPOSITOR é parte integrante do presente contrato e deve ser
        seguido rigorosamente, restando claro que o EXPOSITOR somente assina o
        presente instrumento, pois aceitou todas as regras, condições e
        obrigações contidas no referido manual.
      </Clause>
      <Clause n="13.3.">
        A LOCADORA se reserva no direito de fazer alterações necessárias para
        viabilizar a melhor realização do evento, sem aviso prévio ao LOCATÁRIO,
        não lhe cabendo qualquer indenização.
      </Clause>
      <Clause n="13.4.">
        A não observância de qualquer das cláusulas do presente contrato
        importará na rescisão automática deste, sem prejuízo de eventuais perdas
        e danos.
      </Clause>
      <Clause n="13.5.">
        A tolerância das partes a respeito do descumprimento ou inobservância do
        disposto no presente instrumento não poderá ser considerada como novação
        ou alteração das cláusulas contratuais.
      </Clause>
      <Clause n="13.6.">
        O LOCATÁRIO se dá por ciente e autoriza desde já a utilização da imagem da
        empresa e de seu representante legal, bem como de sua equipe, que poderá
        ser captada e gravada, durante a montagem e realização do evento, seja
        para divulgação por meio de mídia espontânea, redes sociais, cobertura do
        evento, e conteúdo online, de forma que todos os direitos que possui
        sobre sua imagem são cedidos à LOCADORA, de forma gratuita e definitiva.
      </Clause>
      <Clause n="13.7.">
        O LOCATÁRIO se dá por ciente e concorda expressamente que a LOCADORA
        poderá realizar o tratamento de dados estritamente necessários ao
        cumprimento do contrato, bem como para o cumprimento de obrigações
        legais, ou seja, somente para finalidades comerciais específicas e
        legítimas pactuadas nesse Contrato, nos termos e nos limites da Lei Geral
        de Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018.
      </Clause>

      <Heading>14. Do Foro</Heading>
      <Clause n="14.1.">
        As partes elegem o foro da Capital do Estado do Rio de Janeiro para
        dirimir quaisquer dúvidas oriundas do presente contrato.
      </Clause>

      <p className="mt-3 text-justify">
        E, por estarem justos e contratados, assinam o presente em duas vias de
        igual teor e valor na presença de duas testemunhas abaixo assinadas.
      </p>

      <p className="mt-6 text-center">
        Rio de Janeiro, ______ de ____________________ de 2026.
      </p>

      <div className="mt-10 space-y-10">
        <div className="text-center">
          <div className="mx-auto w-3/4 border-t border-neutral-500" />
          <p className="mt-1">LOCADORA/PROMOTORA</p>
        </div>
        <div className="text-center">
          <div className="mx-auto w-3/4 border-t border-neutral-500" />
          <p className="mt-1">LOCATÁRIO/ EXPOSITOR</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-semibold">TESTEMUNHAS:</p>
        <p className="mt-3">1- Nome: <Field value="" min="16rem" /></p>
        <p>CPF: <Field value="" min="12rem" /></p>
        <p className="mt-3">2- Nome: <Field value="" min="16rem" /></p>
        <p>CPF: <Field value="" min="12rem" /></p>
      </div>
    </div>
  );
}
