var $ = require('jquery');

$(document).on('click', 'a[href^="#"]', function(e){
	var target = $( $(this).attr('href') );
	if ( target.length ) {
		e.preventDefault();
		var scrollPos = target.offset().top;
		$('html, body').animate({ scrollTop: scrollPos });
	}
})

$(window).on('scroll',function(e){
	var toTop = $(document).scrollTop();
	if (toTop>200) {
		$('.toTop').addClass('visible');
	} else {
		$('.toTop').removeClass('visible');
	}
})
