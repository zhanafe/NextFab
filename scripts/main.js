$(document).ready(function(){


  $(".wrapper").page_scroll();

  $('.nav li:eq(0)').click(function(){$(".wrapper").moveTo(1);});
  $('.nav li:eq(1)').click(function(){$(".wrapper").moveTo(2);});
  $('.nav li:eq(2)').click(function(){$(".wrapper").moveTo(3);});
  $('.nav li:eq(3)').click(function(){$(".wrapper").moveTo(4);});
  $('.nav li:eq(4)').click(function(){$(".wrapper").moveTo(5);});
  $('.nav li:eq(5)').click(function(){$(".wrapper").moveTo(6);});
  $('.nav li:eq(6)').click(function(){$(".wrapper").moveTo(7);});

  $('.start').click(function(){$(".wrapper").moveTo(2);});

});
