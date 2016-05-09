[![cardslider Logo](logo.png "cardslider Logo")](http://cardslider.konstantingassmann.de)

# jQuery cardslider

A simple and lightweight cardslider plugin. Take a look at the demo [here](http://cardslider.konstantingassmann.de).

## setup

1. Include the basic html markup
```html
<div class="cardslider">
	<ul>
		<li>card 1</li>
		<li>card 2</li>
	</ul>
</div>
```

2. Include the cardslider stylesheet, jQuery and the cardslider js files.
```html
<link href="/cardslider.css" rel="stylesheet">
...
<script src="//code.jquery.com/jquery-2.2.2.min.js"></script>
<script src="/path/to/jquery.cardslider.min.js"></script>
```

3. Initialize the plugin. For more options see below
```html
<script>
	$(function() {
		$('.cardslider').cardslider();
	});
</script>
```

Swipe support is added through [jquery.event.swipe](https://github.com/stephband/jquery.event.swipe). Just include their scripts before you include cardslider and you're good to go.

## options

### keys
Type: ```object```/```bool``` Default: object, see example

set keys to navigate back and forth
```javascript
keys: {
	next: 38,
    prev: 40
}
```

### direction
Type: ```string``` Default: ```down```

Set sliding direction. Possible values: ```up```, ```down```, ```right```, ```left```

### nav
Type: ```bool```Default: ```true```

Enable or disable the navigation

### swipe
Type: ```bool``` Default: ```false```

Enable or disable swiping on the cards

### dots
Type: ```bool``` Default: ```false```

Enable or disable the dot nav

## callback functions

### beforeCardChange
Fires before the cards are changed. Takes the index of the current card as parameter

### afterCardChange

Fires after the cards are changed. Takes the index of the next card as parameter

## methods

### nextCard

Slide to the next card

### prev card

Slide to the previous card

### changeCardTo
Parameters: ```int```/```string```

Slide to given index or strings(```first```, ```last```)

### destroy
Destroys the cardslider. Removes all appended styles and classes