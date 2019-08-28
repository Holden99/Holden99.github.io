

$(document).ready(function(){

// скроллинг
	 $('.go_to').click( function(){ // ловим клик по ссылке с классом go_to
	var scroll_el = $(this).attr('href'); // возьмем содержимое атрибута href, должен быть селектором, т.е. например начинаться с # или .
        if ($(scroll_el).length != 0) { // проверим существование элемента чтобы избежать ошибки
	    $('html, body').animate({ scrollTop: $(scroll_el).offset().top }, 500); // анимируем скроолинг к элементу scroll_el
        }
	    return false; // выключаем стандартное действие
    });




// слайдер
      $('.slider').slick({
      	 	dots: true,
      	 	dotsClass: 'comments__circles',
      	 	infinite: true,
      		nextArrow: '<i class="fas fa-angle-right"></i>',
      		prevArrow:'<i class="fas fa-angle-left"></i>'
      	});


// модальное окно
$('#phone-call').click(function()
{
    $('#exampleModal').arcticmodal(
    {
    	openEffect: { speed: 400 },
		closeEffect: { speed: 400 },

   		 overlay: {
    		
	        css: 	{
	           	 		backgroundColor: '#32c2d1'    
	        		}
    			}
    		
    
    });
 
});



$('#phone-call-footer').click(function()
{
    $('#exampleModal').arcticmodal(
    {
    	openEffect: { speed: 400 },
		closeEffect: { speed: 400 },

   		 overlay: {
    		
	        css: 	{
	           	 		backgroundColor: '#32c2d1'    
	        		}
    			}
    		
    
    });
 
});






$('#exampleModal').css('background-color', '#32c2d1');
$('#box-modal_close').css('color','white');
})
















