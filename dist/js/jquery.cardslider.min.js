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
			afterCardChange: null,
      showCards: 0
		};

	function Plugin ( element, options ) {
		this.element = element;

    options.showCards-=1;

		this.settings = $.extend( {}, defaults, options );
		this._defaults = defaults;
		this._name = pluginName;
		this._cards = [];
		this._activeCard = null;
		this._directionClass = 'cardslider--direction-'+this.settings.direction;
		this._animationClassBack = 'cardslider--sortback-'+this.settings.direction;
		this._animationClassFront = 'cardslider--sortfront-'+this.settings.direction;
		this._dotnav = null;
		this._directionnav = null;
		this._buttonNext = null;
		this._buttonPrev = null;
		this._xDown = null;
		this._yDown = null;
		this._swipeThreshold = 100;

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

			if(this.settings.swipe) {
				this.initSwipe();
			}

			if(this.settings.keys !== false) {
				window.addEventListener('keydown', this.keyNav.bind(this));
			}

			this.changeCardTo(0);
		},
		initCards: function() {

			this.element.className = this.element.className + ' cardslider ' + this._directionClass;

			var list = this.element.querySelector('ul');
			if(!list) return false;

			list.classList.add('cardslider__cards');

      var rawcards = list.children;
      for(var i = 0; i < rawcards.length; i++) {
        var rawcard = rawcards[i];

        var hidden = this.settings.showCards != 0 && i > this.settings.showCards;

        var card = {
					elem: rawcard,
					active: i === 0? true : false,
					index: i,
					cardClass: 'cardslider__card--index-' + i
				};

        card.elem.className = card.elem.className
        + ' cardslider__card cardslider__card--transitions '
        + card.cardClass
        + (hidden && ' cardslider__card--invisible');

        card.elem.style.zIndex = rawcards.length - i;

				this._cards.push(card);
      }
		},
		initNav: function() {
			this._directionnav = document.createElement('div');
			this._directionnav.className = 'cardslider__direction-nav';

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

			this._directionnav.appendChild(this._buttonNext);
			this._directionnav.appendChild(this._buttonPrev);
			this.element.appendChild(this._directionnav);
		},
		initDots: function() {
			var cardslider = this;
			this._dotnav = document.createElement('ul');
			this._dotnav.className = 'cardslider__dots-nav';

			for(var i = 0; i < this._cards.length; i++) {
				var dot = document.createElement('button');
        dot.className = 'cardslider__dot-btn';
				dot.setAttribute('data-slide', i);
				dot.setAttribute('type', 'button');

				dot.addEventListener('click', function(e) {
					cardslider.changeCardTo(parseInt(e.target.getAttribute('data-slide')));
				});

				var listItem = document.createElement('li');
				listItem.className = 'cardslider__dot';
        listItem.appendChild(dot)
				this._dotnav.appendChild(listItem);
			}

			this.element.appendChild(this._dotnav);
		},
		initSwipe: function() {
      this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive:true});
			this.element.addEventListener('touchmove', this.handleTouchEnd.bind(this), {passive:true});
		},
		handleTouchStart: function(e) {
      this._xDown = e.touches[0].clientX;
      this._yDown = e.touches[0].clientY;
		},
		handleTouchEnd: function(e) {
  		e.preventDefault();

      if ( ! this._xDown || ! this._yDown ) {
        return;
      }

      var next = false;
      var prev = false;

      var xUp = e.touches[0].clientX;
      var yUp = e.touches[0].clientY;

      var xDiff = this._xDown - xUp;
      var yDiff = this._yDown - yUp;

      if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {

        if(Math.abs(xDiff) < this._swipeThreshold) {return;}

        if ( xDiff > 0 ) { // left swipe
          if(this.settings.direction == 'left') {
            next = true;
          }
          else if(this.settings.direction == 'right') {
            prev = true;
          }
        } else { //right swipe
          if(this.settings.direction == 'right') {
            next = true;
          }
          else if(this.settings.direction == 'left') {
            prev = true;
          }
        }
      } else {

        if(Math.abs(yDiff) < this._swipeThreshold) {return;}

        if ( yDiff > 0 ) { //up swipe
          if(this.settings.direction == 'up') {
            next = true;
          }
          else if(this.settings.direction == 'down') {
            prev = true;
          }
        } else { //down swipe
          if(this.settings.direction == 'down') {
            next = true;
          }
          else if(this.settings.direction == 'up') {
            prev = true;
          }
        }
      }

      if(next) {
        this.nextCard();
      }
      else if(prev) {
        this.prevCard();
      }

      this._xDown = null;
      this._yDown = null;
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
        var that = this;
        this._cards.forEach(function(card) {
          card.elem.classList.remove(that._animationClassFront);
  				card.elem.classList.remove(that._animationClassBack);
  				card.elem.classList.add('cardslider__card--transitions');
        });
			}

			// fire before callback
			if(typeof this.settings.beforeCardChange == 'function') {
				this.settings.beforeCardChange(oldCard.index);
			}

			if(oldCard && (index > oldCard.index || (index < oldCard.index && resetZ)) || !oldCard && index > 0) {
				for(var i = 0; i < indexAbs; i++) {

  				this._cards[i].elem.setAttribute('aria-hidden', true);

					if(!this.settings.loop) {
  				  this._cards[i].elem.classList.add('cardslider__card--out');
  				}
				}

				if(this.settings.loop && oldCard != null) {
          oldCard.elem.classList.remove('cardslider__card--transitions');
          oldCard.elem.classList.add(this._animationClassBack);
        }
			}
			else if(oldCard) {
        if(this.settings.loop && oldCard) {
          this._cards[indexAbs].elem.classList.remove('cardslider__card--transitions');
  			  this._cards[indexAbs].elem.classList.add(this._animationClassFront);
  			}
        this._cards.forEach(function(card) {
          card.elem.classList.add('cardslider__card--out');
					card.elem.setAttribute('aria-hidden', true);
        });
			}

      // make the front most card to the active one
			this._activeCard = newCard;
			this._activeCard.elem.setAttribute('aria-hidden', false);

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
      var active = this._dotnav.querySelector('.cardslider__dot--active');
      if(active) {
        active.classList.remove('cardslider__dot--active');
      }

      var next = this._dotnav.querySelector('.cardslider__dot:nth-child('+(index+1)+')');
      if(next) {
        next.classList.add('cardslider__dot--active');
      }
		},
		reorderIndices: function(index) {
      var that = this;
      var cardLen = that._cards.length - 1;
  		this._cards.forEach(function(card, i) {
				if(i-index >= 0) {
  				var cardClasses = card.elem.className;
          cardClasses = cardClasses.replace(/cardslider__card--index-\d|cardslider__card--out/g, '');
  				card.elem.className = cardClasses.replace('  ',' ').trim();

          var newCardClass = that._cards[i-index].cardClass;

          card.elem.classList.add(newCardClass);

          var parsed = parseInt(newCardClass.slice(-1));

          if(parsed > that.settings.showCards) {
            card.elem.classList.add('cardslider__card--invisible');
          }
          else {
            card.elem.classList.remove('cardslider__card--invisible');
          }

          if(that.settings.loop) {
					  that.setZindex(card, cardLen - that._cards[i-index].index);
					}
				}
				else if(that.settings.loop) {
  				var cardClasses = card.elem.className;
  				cardClasses = cardClasses.replace(/cardslider__card--index-\d|cardslider__card--out/g, '');
  				card.elem.className = cardClasses.replace('  ',' ').trim();
          var newCardClass = that._cards[that._cards.length-(index-i)].cardClass;
					card.elem.classList.add(newCardClass);

          var parsed = parseInt(newCardClass.slice(-1));

          if(parsed > that.settings.showCards) {
            card.elem.classList.add('cardslider__card--invisible');
          }
          else {
            card.elem.classList.remove('cardslider__card--invisible');
          }

					that.setZindex(card, cardLen - that._cards[that._cards.length-(index-i)].index);
				}
  		});
		},
		setZindex: function(elem, index) {
  		elem.elem.style.zIndex = index;
		},
		destroy: function() {
			var list = this.element.querySelector('.cardslider__cards');
			this.element.className = this.element.className.replace(this.element.className.match(/card.*/g)[0], '');

			list.classList.remove('cardslider__cards');

			this._cards.forEach(function(card) {
  		  card.elem.className = card.elem.className.replace(card.elem.className.match(/card.*/g)[0], '');
  			card.elem.removeAttribute('style');
  			card.elem.removeAttribute('aria-hidden');
			});

      if(this._dotnav) {
		    this._dotnav.parentElement.removeChild(this._dotnav);
		    this._dotnav = null;
      }

      if(this._directionnav) {
			  this._directionnav.parentElement.removeChild(this._directionnav);
			  this._directionnav = null;
      }

			this._cards = [];
			this._activeCard = null;

      if(this.settings.keys !== false) {
			  window.removeEventListener('keydown', this.keyNav);
      }

      if(this._buttonNext) {
			  this._buttonNext.removeEventListener('cardslider', this.nextCard);
      }

      if(this._buttonPrev) {
			  this._buttonPrev.removeEventListener('cardslider', this.prevCard);
      }

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
