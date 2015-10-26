/* ブラックジャックのjsファイル
 * 2015/08/17 作成
 *
 *
 * 
 *
 */


function Card(mark, num) {
  this.img = set_img(mark, num);
  this.num = check_num(num);
  this.mark = mark;
}

function Player() {
  this.hands = [];
  this.ace = false;
  this.game = null;
  this.place = '';
  this.blackjack = false;
  this.bust = false;
}

var isBust = function(sum) {
  if (sum >= 22) {
    return true;
  } else {
    return false;
  }
};

var isBlackJack = function(sum) {
  if (sum == 21) {
    return true;
  } else {
    return false;
  }
};

var hasAce = function(player, sum) {
  if (player.ace && sum <= 10) {
    return sum + 10;
  } else {
    return sum;
  }
};


var checkHands = function(player) {
  var sum = sumHands(player.hands);
  sum = hasAce(player, sum);
  
  if (isBlackJack(sum)) {
    player.blackjack = true;
  } else if (isBust(sum)) {
    player.bust = true;
  }
};

// 10以上のカードの数字を10に
var check_num =　function (num) {
  if (num > 10) {
    num = 10;
  }
  return num;
};

function set_img(mark, num) {
  if (num < 10) num = '0' + num;
  img = mark + num + '.gif';
  return img;
}

// カードを初期化してセット
var initCard  = function() {
  var deck = [];
  marks = ['c', 'd', 'h', 's'];
  for (var m in marks) {
    for (var n = 1; n < 14; n++) {
      deck.push(new Card(marks[m], n));
    }  
  }
  shuffle(deck);
  return deck;
}; 

// カードをシャッフルする関数
var shuffle = function(deck) {
  
  for (var i = 0; i < 104; i++) {
    var rnd = Math.floor(Math.random() * deck.length);
    var tmp = deck[0];
    deck[0] = deck[rnd];
    deck[rnd] = tmp;
  }
};

// カードを表示させる
var displayCard = function(place, card) {
  var c = '<div class="card" id="card" style="background-image: url(./img/' + 
          card + ')"></div>';
  $('div.' + place).append(c);
  $('div.' + place + ' div.card:hidden').fadeIn('slow').css('display', 'inline-block');
};

// 配列の合計をもとめる
var sumHands = function(array) {
  return array.reduce(function(a, b) { return a + b.num; }, 0);
};

var isAce = function(num) {
  if (num == 1) {
    return true;
  } else {
    return false;
  }
};


var game = {
  deck: null,
  you: null,
  dealer: null,
  chips : 10,
  bet: 0,

  // プレイヤーを設置する
  setPlayers: function() {
    this.you = new Player();
    this.dealer = new Player();
    this.you.game = this;
    this.dealer.game = this;
    this.you.place = 'your-hands';
    this.dealer.place = 'dealers-hands';
  },
 
  setDeck: function() {
    this.deck = initCard();
  },

  setGame: function() {
    this.setPlayers();
    this.dealCards();
    checkHands(this.you);
    checkHands(this.dealer);
  },

  initGame: function() {
    $('div#your-hands').empty();
    $('div#dealers-hands').empty();
    $('div#message').empty();
    this.setGame();
    $('.button1').hide();
    if (this.you.blackjack) {
      this.dealersTern();
    } else {
      $('.button2').show();
    }
  },


  // ゲームの最初にカードを配る
  dealCards: function() {
    this.dealerCardSet();
    this.hitCard(this.dealer);
    this.hitCard(this.you);
    this.hitCard(this.you);
  },

  // カードを引く
  hitCard: function(player) {
    var card = this.deck.shift();
    player.hands.push(card);
    player.ace = isAce(card.num);
    displayCard(player.place, card.img);
    this.checkDeck();
  },

  yourTern: function() {
    this.hitCard(this.you);
    checkHands(this.you);
    this.youBust();
  },

  youBust: function() {
    if (this.you.bust) {
      $('div.message').append('<h2>You busted!! You lose.</h2>');
      $('.button2').hide();
      $('.button1').show();
    } 
  },

  dealerBust: function() {
    checkHands(this.dealer);
    if (this.dealer.bust) {
      this.openCard();
      $('div.message').append('<h2>The dealer busted!! You win.</h2>');
      $('.button2').hide();
      $('.button1').show();
    }
  },

  openCard: function() {
    var card = 'url("./img/' + this.dealer.hands[0].img + '")';
    $('div#dealers-hands div.card:first-child').css('background-image', card);
  },

  judge: function() {
    this.openCard();
    var yourHands = sumHands(this.you.hands);
    var dealersHands = sumHands(this.you.hands);
    var message;

    if (this.dealer.blackjack) {
      message = 'BlackJack!! You lose.';
    } else if(this.you.blackjack) {
      message = 'BlackJack!! You win.'; 
    } else if (yourHands > dealersHands) {
      message = 'You win.';
    } else {
      message = 'You lose.';
    }

    $('div.message').append('<h2>' + message + '</h2>');
    $('.button2').hide();
    $('.button1').show();
 
  },

  // ディーラーが最初にカードを引く
  dealerCardSet: function() {
    var card = this.deck.shift();
    this.dealer.hands.push(card);
    this.dealer.ace = isAce(card.num);
    displayCard(this.dealer.place, 'z01.gif');
    this.checkDeck();

  },

  // デッキが0になったら補充する
  checkDeck: function() {
    if (this.deck.length <= 0) {
      this.setDeck();
    }
  },

  dealersTern: function() {
    while (!this.dealer.blackjack &&  sumHands(this.dealer.hands) < 17) {
      this.hitCard(this.dealer);
      checkHands(this.dealer);
      this.dealerBust();
    }
    if (!this.dealer.bust) {
      this.judge();
    }
  }

};


jQuery(function ($) {
  game.setDeck();
});
