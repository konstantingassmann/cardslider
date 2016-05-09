;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
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
				beforeCardChange: null,
				afterCardChange: null
			};

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this._cards = [];
			this._activeCard = null;
			this._directionClass = 'direction-'+this.settings.direction;
			this._$dotnav = null;
			this._$directionnav = null;
			this.init();
		}

		// Avoid Plugin.prototype conflicts
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
					$(window).on('keydown', this.keyNav.bind(this));
				}
				
				this.changeCardTo(0);
			},
			initCards: function() {

				var $element = $(this.element);
				$element.addClass('cardslider '+this._directionClass);
				var $list = $element.find('> ul');
				$list.addClass('cardslider-cards');
				var rawcards = $list.find('li');
				var scale = 1;
				var y = 0;
				var brightness = 255;
				
				for(var i = 0; i < rawcards.length; i++) {

					var card = {
						$elem: $(rawcards[i]),
						active: i === 0? true : false,
						index: i,
						cardClass: 'card-'+i
					};
					
					card.$elem.addClass('cardslider-card '+card.cardClass);
					
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
				this._$directionnav = $('<div class="cardslider-direction-nav" />');
				var $buttonNext = $('<button title="next" class="cardslider-nav-next">Next</button>');
				var $buttonPrev = $('<button title="previous" class="cardslider-nav-prev">Prev</button>');
				
				$buttonNext.on('click', this.nextCard.bind(this));
				$buttonPrev.on('click', this.prevCard.bind(this));
				
				this._$directionnav.append($buttonNext);
				this._$directionnav.append($buttonPrev);
				$(this.element).append(this._$directionnav);
			},
			initDots: function() {
				var cardslider = this;
				this._$dotnav = $('<ul class="cardslider-dots-nav" />');
				
				for(var i = 0; i < this._cards.length; i++) {
					var $link = $('<a href="#" />');
					$link.attr('data-slide', i);
					$link.on('click', function(e) {
						e.preventDefault();
						cardslider.changeCardTo($(this).data('slide'));
					});
					var $listItem = $('<li aria-hidden="true" class="cardslider-dot" />');
					this._$dotnav.append($listItem.append($link));
				}
				
				$(this.element).append(this._$dotnav);
			},
			initSwipe: function() {
				$(this.element).find('.cardslider-cards').on('swipeup', this.prevCard.bind(this));
				
				$(this.element).find('.cardslider-cards').on('swipedown', this.nextCard.bind(this));	
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
				
			},
			prevCard: function() {
				if(this._activeCard.index - 1 >= 0) {
					this.changeCardTo(this._activeCard.index - 1);
				}
			},
			changeCardTo: function(index) {
				
				if(typeof index == 'string') {
					if(index == 'first') {
						index = 0;
					}
					else {
						index = this._cards.length-1;
					}
				}
				
				if(typeof this.settings.beforeCardChange == 'function') {
					this.settings.beforeCardChange(this._activeCard.index);
				}
				
				if(this._activeCard && index > this._activeCard.index || !this._activeCard && index > 0) {
					for(var i = 0; i < index; i++) {
						this._cards[i].$elem.addClass('out');
						this._cards[i].$elem.attr('aria-hidden', true);
					}
					
				}
				else {
					for(var i = this._cards.length-1; i > index; i--) {
						this._cards[i].$elem.addClass('out');
						this._cards[i].$elem.attr('aria-hidden', true);
					}
				}
				
				if(this.settings.dots) {
					this._$dotnav.find('li.active').removeClass('active');
					this._$dotnav.find('li').eq(index).addClass('active');
				}
				
				this._activeCard = this._cards[index];
				this._activeCard.$elem.attr('aria-hidden', false);
				this.reorderCardClasses(index);
				
				if(typeof this.settings.afterCardChange == 'function') {
					this.settings.afterCardChange(index);
				}
				
				return this;
			},
			reorderCardClasses: function(index) {
				for(var i = 0; i < this._cards.length; i++) {
					
					var card = this._cards[i];
					
					if(i-index >= 0) {
						card.$elem.removeClass(function(i, css) {return(css.match(/card-.*/g) || []).join(' ');});
						card.$elem.addClass(this._cards[i-index].cardClass);
					}
					else {
						card.$elem.addClass(this._outClass);
					}	
				}					
			},
			destroy: function() {
				var $element = $(this.element);
				var $list = $element.find('.cardslider-cards');
				$element.removeClass('cardslider');
				$list.removeClass('cardslider-cards');
				$list.find('.cardslider-card').removeClass(function(i, css) {return(css.match(/card.*/g) || []).join(' ');}).removeAttr('style');
				
				this._$dotnav.remove();
				this._$dotnav = null;
				
				this._$directionnav.remove();
				this._$directionnav = null;
				
				this._cards = [];
				this._activeCard = null;
				
				return this;
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, pluginName ) ) {
					$.data( this, pluginName, new Plugin( this, options ) );
				}
			} );
		};

} )( jQuery, window, document );
