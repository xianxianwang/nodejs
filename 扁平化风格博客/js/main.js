$(document).ready(function(){
	var sidebar = $('#sidebar');
	var mask = $('#mask');
	var sidebar_trigger = $('#sidebar_trigger');
	var backtop = $('.backtop');

	sidebar_trigger.on('click',function(){
		mask.fadeIn();
		sidebar.animate({'right':0},'slow');
	});

	mask.on('click',function(){
		mask.fadeOut();
		sidebar.animate({'right':-sidebar.width()},'slow');
	});
	// 返回顶部
	backtop.on('click',function(){
		$('html,body').animate({'scrollTop':0},'800s');
	});

	$(window).on('scroll',function(){
		if($(window).scrollTop() > $(window).height())
			backtop.fadeIn();
		else
			backtop.fadeOut();
	});
});