/* 2015/09/07
 *
 *
 *
 *
 *  */

function Card(mark, num) {
  this.img = set_img(mark, num);
  this.num = check_num(num);
  this.mark = mark;
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

// カードをシャッフルする関数:
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

var check_num = function(num) {
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

function Player() {
  this.hands = [];
  this.ace = false;
  this.game = null;
  this.place = '';
  this.blackjack = false;
  this.bust = false;
  this.sum = 0;

  this.setParam = function() {
    var sum = checkSum(this);
    this.blackjack = isBlackJack(sum);
    this.bust = isBust(sum);
    this.sum = sum;
  };

}

var getSum = function(array) {
  return array.reduce(function(a, b) { return a + b.num; }, 0);
};

var checkSum = function(player) {
  var sum = getSum(player.hands);
  if (player.ace && sum <= 11) {
    return sum + 10;
  } else {
    return sum;
  }
};
 
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

var isAce = function(num, ace) {
  if (num == 1 || ace) {
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
  started: false,

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
  },

  initGame: function() {
    $('div#your-hands').empty();
    $('div#dealers-hands').empty();
    $('div#message').empty();
    this.setGame();
    $('.button1').hide();
    this.started = true;
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
    player.ace = isAce(card.num, player.ace);
    player.setParam();
    displayCard(player.place, card.img);
    this.checkDeck();
  },

  yourTern: function() {
    this.hitCard(this.you);
    if (this.you.bust) {
      this.youBust();
    }
  },

  youBust: function() {
      $('div.message').append('<h2>You busted!! You lose.</h2>');
      $('.button2').hide();
      $('.button1').show();
      this.refund(false);
  },

  dealerBust: function() {
      this.openCard();
      $('div.message').append('<h2>The dealer busted!! You win.</h2>');
      $('.button2').hide();
      $('.button1').show();
      this.refund(true);
  },

  dealerBlackjack: function() {
      this.openCard();
      $('div.message').append('<h2>BlackJack!! You lose.</h2>');
      $('.button2').hide();
      $('.button1').show();
      this.refund(false);
 
  },

  openCard: function() {
    var card = 'url("./img/' + this.dealer.hands[0].img + '")';
    $('div#dealers-hands div.card:first-child').css('background-image', card);
  },

  judge: function() {
    this.openCard();
    var message;
    if(this.you.blackjack === true) {
      message = 'BlackJack!!';
    } else {
      message = this.you.sum + ' vs ' + this.dealer.sum + ' ';
    }
    if (this.you.sum > this.dealer.sum) {
      message += 'You win.';
      youWin = true;
    } else {
      message += 'You lose.';
      youWin = false;
    }

    $('div.message').append('<h2>' + message + '</h2>');
    $('.button2').hide();
    $('.button1').show();
    this.refund(youWin);
 
  },

  // ゲームの場代の支払い
  anti: function() {
      this.chips -= 1;
      this.bet = 1;
      this.setNumberOfChips();
  },

  // 賭金の払い戻し
  refund: function(youWin) {
    // ブラックジャックで勝つと賭金が3倍
    if (youWin && this.you.blackjack) {
      this.chips += this.bet * 3;
    } else if (youWin) {
      this.chips += this.bet * 2;
    } else {
      this.bet = 0;
    }
    this.started = false;
    if (this.chips === 0) {
      this.gameOver();
      return;
    }
    this.anti();
  },

  // 賭金を増やす
  betChip: function() {
    if (!this.started && this.bet < 5 && this.chips >= 1) {
      this.chips -= 1;
      this.bet += 1;
      this.setNumberOfChips();
    }
  },

  // 賭金を減らす
  cancelBet: function() {
    if(!this.started && this.bet >= 2) {
      this.bet -= 1;
      this.chips += 1;
      this.setNumberOfChips();
    }
  },

  setNumberOfChips: function() {
    var numberOfChips = this.chips;
    var bettedChips = this.bet;
    $('#number-of-chips').text(numberOfChips);
    $('#number-of-betted-chips').text(bettedChips);
  },


  // ディーラーが最初にカードを引く
  dealerCardSet: function() {
    var card = this.deck.shift();
    this.dealer.hands.push(card);
    this.dealer.ace = isAce(card.num, false);
    this.dealer.setParam();
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
    while (!this.dealer.blackjack && !this.dealer.bust && this.dealer.sum <= 16) {
      this.hitCard(this.dealer);
    }
    if (this.dealer.blackjack) {
      this.dealerBlackjack();
    } else if (this.dealer.bust) {
      this.dealerBust();
    } else {
      this.judge();
    }
  },

  gameOver: function() {
    $('div.message').append('<h2>Game over</h2>');
    $('.button1').hide();
  }

};


jQuery(function ($) {
  game.setDeck();
  game.anti();

  $('#bet').click(function() {
    game.betChip();
  });
  $('#chips').click(function() {
    game.cancelBet();
  });
});
