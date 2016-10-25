;(function (factory) {
	if(typeof module === "object" && typeof module.exports === "object") {
		factory(require("jquery"), window, document);
	} else {
		factory(jQuery, window, document);
	}
}( function( $, window, document, undefined ) {

	"use strict";

	var pluginName = "cardslider",
		defaults = {
			keys: {
				next: 38,
				prev: 40
			},
			direction: 'down',
			nav: true,
			swipe: false,
			dots: false,
			loop: false,
			beforeCardChange: null,
			afterCardChange: null
		};

	function Plugin ( element, options ) {
		this.element = element;

		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this._cards = [];
		this._activeCard = null;
		this._directionClass = 'cardslider--direction-'+this.settings.direction;
		this._animationClassBack = 'cardslider--sortback-'+this.settings.direction;
		this._animationClassFront = 'cardslider--sortfront-'+this.settings.direction;
		this._$dotnav = null;
		this._$directionnav = null;
		this._buttonNext = null;
		this._buttonPrev = null;
		this.init();
	}

	$.extend( Plugin.prototype, {
		init: function() {

			this.initCards();

			if(this.settings.nav) {
				this.initNav();
			}

			if(this.settings.dots) {
				this.initDots();
			}

			if($.event.special.swipe && this.settings.swipe) {
				this.initSwipe();
			}

			if(this.settings.keys !== false) {
				$(window).on('keydown.cardslider', this.keyNav.bind(this));
			}

			this.changeCardTo(0);
		},
		initCards: function() {

			var $element = $(this.element);
			$element.addClass('cardslider '+this._directionClass);
			var $list = $element.find('> ul');
			$list.addClass('cardslider__cards');

			var rawcards = $list.find('li');

			var scale = 1;
			var y = 0;
			var brightness = 255;

			for(var i = 0; i < rawcards.length; i++) {

				var card = {
					$elem: $(rawcards[i]),
					active: i === 0? true : false,
					index: i,
					cardClass: 'cardslider__card--index-' + i
				};

        card.$elem.addClass('cardslider__card cardslider__card--transitions '+card.cardClass);

        card.$elem.css({
          'z-index': rawcards.length - i
        });

				this._cards.push(card);

				scale = scale - 0.05;
				y-=20;
				brightness-=10;
			}
		},
		initNav: function() {
			this._$directionnav = $('<div class="cardslider__direction-nav" />');

			this._buttonNext = document.createElement('button');
			this._buttonNext.title = 'next';
			this._buttonNext.className = 'cardslider__nav-next';
			this._buttonNext.innerHTML = 'Next';
      this._buttonNext.addEventListener('click', this.nextCard.bind(this));

			this._buttonPrev = document.createElement('button');
			this._buttonPrev.title = 'previous';
			this._buttonPrev.className = 'cardslider__nav-prev';
			this._buttonPrev.innerHTML = 'Prev';
      this._buttonPrev.addEventListener('click', this.prevCard.bind(this));

			this._$directionnav.append(this._buttonNext);
			this._$directionnav.append(this._buttonPrev);
			$(this.element).append(this._$directionnav);
		},
		initDots: function() {
			var cardslider = this;
			this._$dotnav = $('<ul class="cardslider__dots-nav" />');

      var cardAmt = this._cards.length;
      var startIndex = 0;

			for(var i = startIndex; i < cardAmt; i++) {
				var $link = $('<a href="#" />');
				$link.attr('data-slide', i);
				$link.on('click.cardslider', function(e) {
					e.preventDefault();
					cardslider.changeCardTo($(this).data('slide'));
				});
				var $listItem = $('<li class="cardslider__dot" />');
				this._$dotnav.append($listItem.append($link));
			}

			$(this.element).append(this._$dotnav);
		},
		initSwipe: function() {
			$(this.element).find('.cardslider__cards').on('swipeup.cardslider', this.prevCard.bind(this));

			$(this.element).find('.cardslider__cards').on('swipedown.cardslider', this.nextCard.bind(this));
		},
		keyNav: function(e) {
			if(e.keyCode == this.settings.keys.next) {
				e.preventDefault();
				this.nextCard();
			}
			else if(e.keyCode == this.settings.keys.prev) {
				e.preventDefault();
				this.prevCard();
			}
		},
		nextCard: function() {
			if(this._activeCard.index + 1 < this._cards.length) {
				this.changeCardTo(this._activeCard.index + 1);
			}
			else if(this.settings.loop) {
        this.changeCardTo(0, true);
			}
		},
		prevCard: function() {
			if(this._activeCard.index - 1 >= 0) {
				this.changeCardTo(this._activeCard.index - 1);
			}
			else if(this.settings.loop) {
        this.changeCardTo((this._cards.length-1)*-1);
			}
		},
		changeCardTo: function(index, resetZ) {

      // set param default
      resetZ = typeof resetZ != 'undefined'? resetZ : false;

      // normalize indeX
      if(typeof index == 'string') {
				if(index == 'first') {
					index = 0;
				}
				else {
					index = this._cards.length-1;
				}
			}

			var indexAbs = Math.abs(index);

			// set variables for easy access
			var oldCard = this._activeCard;
			var newCard = this._cards[indexAbs];

      // remove left over animation classes
      if(this.settings.loop) {
        for(var i = 0; i < this._cards.length; i++) {
  				this._cards[i].$elem.removeClass(this._animationClassFront + ' ' + this._animationClassBack);
  				this._cards[i].$elem.addClass('cardslider__card--transitions');
  			}
			}

			// fire before callback
			if(typeof this.settings.beforeCardChange == 'function') {
				this.settings.beforeCardChange(oldCard.index);
			}

			if(oldCard && (index > oldCard.index || (index < oldCard.index && resetZ)) || !oldCard && index > 0) {
				for(var i = 0; i < indexAbs; i++) {

  				this._cards[i].$elem.attr('aria-hidden', true);

					if(!this.settings.loop) {
  				  this._cards[i].$elem.addClass('cardslider__card--out');
  				}
				}

				if(this.settings.loop && oldCard != null) {
          oldCard.$elem.removeClass('cardslider__card--transitions');
          oldCard.$elem.addClass(this._animationClassBack);
        }
			}
			else if(oldCard) {
        if(this.settings.loop && oldCard) {
          this._cards[indexAbs].$elem.removeClass('cardslider__card--transitions');
  			  this._cards[indexAbs].$elem.addClass(this._animationClassFront);
  			}

				for(var i = this._cards.length-1; i > indexAbs; i--) {
					this._cards[i].$elem.addClass('cardslider__card--out');
					this._cards[i].$elem.attr('aria-hidden', true);
				}
			}

      // make the front most card to the active one
			this._activeCard = newCard;
			this._activeCard.$elem.attr('aria-hidden', false);

      // reorder all index classes to push the cards to their new position
			this.reorderIndices(indexAbs);

      // change the dot nav
      if(this.settings.dots) {
				this.changeDots(indexAbs);
			}

      // fire after callback
      if(typeof this.settings.afterCardChange == 'function') {
				this.settings.afterCardChange(indexAbs);
			}

			return this;
		},
		changeDots: function(index) {
      this._$dotnav.find('.cardslider__dot--active').removeClass('cardslider__dot--active');
			this._$dotnav.find('.cardslider__dot').eq(index).addClass('cardslider__dot--active');
		},
		reorderIndices: function(index) {
			for(var i = 0; i < this._cards.length; i++) {

				var card = this._cards[i];

				if(i-index >= 0) {
  				card.$elem.removeClass(function(i, css) {return(css.match(/cardslider__card--index-\d|cardslider__card--out/g) || []).join(' ');});
					card.$elem.addClass(this._cards[i-index].cardClass);
          if(this.settings.loop) {
					  this.setZindex(card, this._cards.length - 1 - this._cards[i-index].index);
					}
				}
				else if(this.settings.loop) {
  				card.$elem.removeClass(function(i, css) {return(css.match(/cardslider__card--index-\d|cardslider__card--out/g) || []).join(' ');});
					card.$elem.addClass(this._cards[this._cards.length-(index-i)].cardClass);
					this.setZindex(card, this._cards.length - 1 - this._cards[this._cards.length-(index-i)].index);
				}
			}
		},
		setZindex: function(elem, index) {
  		elem.$elem.css({
				'z-index': index
			});
		},
		destroy: function() {
			var $element = $(this.element);
			var $list = $element.find('.cardslider__cards');
			$element.removeClass(function(i, css) {return(css.match(/card.*/g) || []).join(' ');})
			$list.removeClass('cardslider__cards');
			$list.find('.cardslider__card').removeClass(function(i, css) {return(css.match(/card.*/g) || []).join(' ');}).removeAttr('style').removeAttr('aria-hidden');

			this._$dotnav.remove();
			this._$dotnav = null;

			this._$directionnav.remove();
			this._$directionnav = null;

			this._cards = [];
			this._activeCard = null;

			$(window).off('keydown.cardslider');

			this._buttonNext.removeEventListener('cardslider', this.nextCard);
			this._buttonPrev.removeEventListener('cardslider', this.prevCard);

			return this;
		}
	} );

	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			if ( !$.data( this, pluginName ) ) {
				$.data( this, pluginName, new Plugin( this, options ) );
			}
		} );
	};
}));
