;(function(w, $) {
  'use strict';

  // Create a full-page overlay and append the content
  function createModal(origin, content) {
      // Clear existing modal, if necessary,
      $('#modal').remove();
      $('.modalOrigin').removeClass('modalOrigin');

      // Create new modal
      var html = (
          '<div id="modal">' +
          '  <div class="inner">' +
          '    <button type="button" class="close">' +
          '      ' + trans('close') +
          '    </button>' +
          '  </div>' +
          '</div>'
      );

      // Add it to the page.
      $('body').addClass("noscroll").append(html);
      $("#modal .inner").append(content);

      $('#modal #overlay').fadeIn('fast');

      $(origin).addClass('modalOrigin');
  }

  function closeModal() {
      $('#modal').fadeOut('fast', function() {
          $overlay.hide();
          var content = $overlay.detach();
          $('#overlay-container').append(content);
          $(this).remove();
      });
      $('body').removeClass('noscroll');
      $('.modalOrigin').focus().remove('modalOrigin');
  }

  // Close modal on clicking close button or background.
  $(w.document).on('click', '#modal .close', closeModal);

  // Close on escape
  $(w.document).on('keyup', function(e) {
      if (e.keyCode === 27) { // esc
          closeModal();
      }
  });
})(window, window.jQuery);