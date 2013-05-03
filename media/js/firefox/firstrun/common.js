;(function($) {
  'use strict';

  var position_video = function() {
    var pos = $('#pinnedtabs-screenshot').offset();
    var scroll_top = $(window).scrollTop();

    var top = pos.top - scroll_top;
    var left = pos.left;
    var $video = $('#pinnedtabs-video');

    $video.css({
      'top': top,
      'left': left
    });

    $('#modal-close').css({
      'top': (top - 16),
      'left': (left + $video.width() - 4)
    });
  };

  $('a[href="#pinnedtabs-video"]').on('click', function(e) {
    e.preventDefault();

    var video = '';

    var content =
      '<video id="pinnedtabs-video" poster="/media/img/firefox/firstrun/pinnedtabs-poster.jpg" controls>'+
      ' <source src="'+video+'.mp4" type="video/mp4">'+
      ' <source src="'+video+'.webm" type="video/webm">'+
      '</video>';

    Mozilla.Modal.create_modal(this, content, position_video);
  });
})(window.jQuery);