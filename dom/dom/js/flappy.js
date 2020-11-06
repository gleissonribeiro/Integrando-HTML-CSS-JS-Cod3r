//*====Funções====
// ====Função criadora de elemenos HTML====
function createElement(tagName, className) {
  const elemento = document.createElement(tagName);
  elemento.className = className;
  return elemento;
}
// ========================================

// ----Função construtora de barreiras----
function Barreira(reversa = false) {
  this.elemento = createElement('div', 'barreira');

  const borda = createElement('div', 'borda');
  const corpo = createElement('div', 'corpo');

  this.elemento.appendChild(reversa ? corpo : borda);
  this.elemento.appendChild(reversa ? borda : corpo);

  this.setAltura = altura => (corpo.style.height = `${altura}px`);
}
// ---------------------------------------

// ====Função construtora de par de barreiras====
function ParDeBarreiras(altura, abertura, x) {
  this.elemento = createElement('div', 'par-de-barreiras');
  this.barCima = new Barreira(true);
  this.barBaixo = new Barreira(false);

  this.elemento.appendChild(this.barCima.elemento);
  this.elemento.appendChild(this.barBaixo.elemento);

  // Seta a altura das barreiras
  this.sortearAbertura = () => {
    const semente = Math.random();
    const alturaSuperior = semente * (altura - abertura);
    const alturaInferior = altura - (abertura + alturaSuperior);

    this.barCima.setAltura(alturaSuperior);
    this.barBaixo.setAltura(alturaInferior);
  };

  // Obtém a posição do par de barreiras
  this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);

  // Seta a posição do par de barreiras
  this.setX = x => (this.elemento.style.left = `${x}px`);

  // Obtém a largura do par de barreiras
  this.getLargura = () => this.elemento.clientWidth;

  // Valores/situação iniciais
  this.sortearAbertura();
  this.setX(x);
}
// ==============================================

// ----Função construtora de vários pares de de barreiras----
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
  // Array com 'Pares de barreiras'
  this.pares = [0, 1, 2, 3].map(
    el => new ParDeBarreiras(altura, abertura, largura + espaco * el)
  );

  // Número de píxels que cada par de barreiras se desloca à esq. em cada frame
  const deslocamento = 3;
  this.animar = () => {
    this.pares.forEach(par => {
      par.setX(par.getX() - deslocamento);

      // Quando o elemento sair da área do jogo
      if (par.getX() < -par.getLargura()) {
        par.setX(par.getX() + espaco * this.pares.length);
        par.sortearAbertura();
      }

      const meio = largura / 2;
      const cruzouOMeio =
        par.getX() + deslocamento >= meio && par.getX() < meio;
      cruzouOMeio && notificarPonto();
    });
  };
}
// __________________________________________________________

// ====Função construtora de pássaro====
function Passaro(alturaJogo) {
  this.elemento = createElement('img', 'passaro');
  this.elemento.src = './imgs/passaro.png';

  this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
  this.setY = y => (this.elemento.style.bottom = `${y}px`);

  let vertDesloc;
  window.onkeydown = e =>
    (vertDesloc = e.keyCode === 38 ? 10 : e.keyCode === 40 ? -10 : -1);
  window.onkeyup = e => (vertDesloc = -1);

  this.animar = () => {
    // const novoY = this.getY() + (voando ? 5 : -3);
    const novoY = this.getY() + vertDesloc;
    const alturaMax = alturaJogo - this.elemento.clientHeight;

    //Seta a posição vertical do pássaro corretamente
    if (novoY >= alturaMax) {
      this.setY(alturaMax);
    } else if (novoY <= 0) {
      this.setY(0);
    } else {
      this.setY(novoY);
    }
  };

  // Início
  this.setY(alturaJogo / 2);
}
// =====================================

// ----Função construtura de progresso----
function Progresso() {
  this.elemento = createElement('span', 'progresso');
  this.atualizarPontos = pontos => (this.elemento.innerHTML = pontos);

  // Início
  this.atualizarPontos(0);
}
// ---------------------------------------

// ----Verifica se 2 elementos estão sobrepostos----
function estaoSobrepostos(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  // Condições para interseção 'horizontal' e 'vertical'
  const hz = a.left + a.width >= b.left && b.left + b.width >= a.left;
  const vt = a.top + a.height >= b.top && b.top + b.height >= a.top;
  return hz && vt;
}
// -------------------------------------------------

// ====Verifica se houve colisão/interseção entre dois elemetos====
function colidiu(passaro, barreiras) {
  let colidiu = false;
  barreiras.pares.forEach(par => {
    if (!colidiu) {
      colidiu =
        estaoSobrepostos(par.barBaixo.elemento, passaro.elemento) ||
        estaoSobrepostos(par.barCima.elemento, passaro.elemento);
    }
  });
  // console.log(colidiu);
  return colidiu;
}
// ================================================================

// ====Função geradora da seção do jogo====
function FlappyBird() {
  let pontos = 0;
  const abertura = 400;
  const espaco = 400;

  const areaJogo = document.querySelector('[wm-flappy]');

  const altura = areaJogo.clientHeight;
  const largura = areaJogo.clientWidth;

  const passaro = new Passaro(altura);
  const barreiras = new Barreiras(altura, largura, abertura, espaco, () =>
    progresso.atualizarPontos(++pontos)
  );
  const progresso = new Progresso();

  areaJogo.appendChild(passaro.elemento);
  barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento));
  areaJogo.appendChild(progresso.elemento);

  this.start = () => {
    const temporizador = setInterval(() => {
      passaro.animar();
      barreiras.animar();
      if (colidiu(passaro, barreiras)) {
        clearInterval(temporizador);
        // areaJogo.classList.add('perdeu');
        areaJogo.innerHTML = `Total de pontos: ${progresso.elemento.innerHTML}`;
      }
    });
  };
}
// ========================================
new FlappyBird().start();

// ****************************************************************
// const b = new ParDeBarreiras(690, 200, 100);
// document.querySelector('[wm-flappy]').appendChild(b.elemento);
// const areaJogo = document.querySelector('[wm-flappy]');

// const barreiras = new Barreiras(690, 1200, 200, 400);
// const passaro = new Passaro(690);
// const progresso = new Progresso();

// barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento));
// areaJogo.appendChild(passaro.elemento);
// areaJogo.appendChild(progresso.elemento);

// setInterval(() => {
//    barreiras.animar();
//    passaro.animar();
// }, 15);
