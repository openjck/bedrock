;(function($) {
  'use strict';

  var $video_container = $('#video-container');
  var $video = $('#pinnedtabs-video');
  var $video_content;

  window.gaq_track = function(category, action, label) {
    if (window._gaq) {
      _gaq.push(['_trackEvent', category, action, label]);
    }
  };

  var position_video = function() {
    var pos = $('#pinnedtabs-screenshot').offset();
    var scroll_top = $(window).scrollTop();

    var top = pos.top - scroll_top;
    var left = pos.left;

    $video.css({
      'top': top,
      'left': left
    });

    $('#modal-close').css({
      'top': (top - 16),
      'left': (left + $video.width() - 4)
    });
  };

  var reattach_video = function() {
    $video_container.append($video_content);
  };

  $('a[href="#pinnedtabs-video"]').on('click', function(e) {
    e.preventDefault();

    $video_content = $video.detach();

    Mozilla.Modal.create_modal(this, $video_content, position_video, reattach_video);

    gaq_track('first run interaction', 'open video', 'Pinned Tabs Video');
  });

  // GA tracking
  $('a.featurelink').on('click', function() {
    gaq_track("first run interaction", "click", $(this).attr('href'));
  });

  $('.social a').on('click', function() {
    gaq_track("social interaction", "click", $(this).attr('class'));
  });

  $video.on('play', function() {
    gaq_track("first run interaction", "play", "Pinned Tabs Video");
  }).on('pause', function() {
    gaq_track("first run interaction", "pause", "Pinned Tabs Video");
  }).on('ended', function() {
    gaq_track("first run interaction", "finish", "Pinned Tabs Video");
  });

  $('#footer-email-form').on('submit', function() {
    gaq_track("Newsletter Registration", "submit", "Registered for Firefox Updates");
  });
})(window.jQuery);