/*!
 *
 * HiM is a men lifestyle journal, issued on monthly basis, to cover all subjects of interest of the
 * modern-age rugged gentleman all over the world; from travel, business, entertainment, entrepreneurship,
 * finance, fashion, skills, gadgets and a lot more
 *
 * EDITOR IN CHIEF. Hesham Yasein. heshamgyassin@gmail.com
 *
 * All rights reserved to HiM 2023 (C)
 *
 * License:
 * This code is based on turnjs - http://turnjs.com
 * Copyright (C) 2012 Emmanuel Garcia
 * The turn.js project is released under the BSD license and it's available on GitHub.
 * This license doesn't include features of the 4th release.
 *
 * Opinions expressed are solely those of the contributors.
 * No part of this magazine may be reproduced or transmitted in any form or by any means without a written
 * permission of the publisher.
 *
 */

(function($) {

'use strict';

var has3d,

zoomOptions = {
  max: 2,
  flipbook: null,
  easeFunction: 'ease-in-out',
  duration: 500,
  when: {}
},

zoomMethods = {
  init: function(opts) {

    var that = this,
    data = this.data(),
    options = $.extend({}, zoomOptions, opts);

    if (!options.flipbook || !options.flipbook.turn('is')) {
      throw error('options.flipbook is required');
    }

    has3d = 'WebKitCSSMatrix' in window || 'MozPerspective' in document.body.style;

    if (typeof(options.max)!='function') {
      var max = options.max;
      options.max = function() { return max; };
    }

    data.zoom = {
      opts: options,
      axis: point2D(0, 0),
      scrollPos: point2D(0, 0),
      eventQueue: [],
      mouseupEvent: function() {
        return zoomMethods._eMouseUp.apply(that, arguments);
      },
      eventTouchStart: bind(zoomMethods._eTouchStart, that),
      eventTouchMove: bind(zoomMethods._eTouchMove, that),
      eventTouchEnd: bind(zoomMethods._eTouchEnd, that),
      flipbookEvents: {
        zooming: bind(zoomMethods._eZoom, that),
        pressed: bind(zoomMethods._ePressed, that),
        released: bind(zoomMethods._eReleased, that),
        start: bind(zoomMethods._eStart, that),
        turning: bind(zoomMethods._eTurning, that),
        turned: bind(zoomMethods._eTurned, that),
        destroying: bind(zoomMethods._eDestroying, that)
      }
    };

    for (var eventName in options.when) {
      if (Object.prototype.hasOwnProperty.call(options.when, eventName)) {
        this.bind('zoom.'+eventName, options.when[eventName]);
      }
    }

    for (eventName in data.zoom.flipbookEvents) {
      if (Object.prototype.hasOwnProperty.call(data.zoom.flipbookEvents, eventName)) {
        options.flipbook.bind(eventName, data.zoom.flipbookEvents[eventName]);
      }
    }

    this.css({
      position: 'relative',
      overflow : 'hidden'
    });

    if ($.isTouch) {

      options.flipbook.
        bind('touchstart', data.zoom.eventTouchStart ).
        bind('touchmove', data.zoom.eventTouchMove).
        bind('touchend', data.zoom.eventTouchEnd);

      this.bind('touchstart', zoomMethods._tap);

    } else {
      this.mousedown(zoomMethods._mousedown).
        click(zoomMethods._tap);
    }
  },

  flipbookWidth: function() {
    
    var data = this.data().zoom,
      flipbook = data.opts.flipbook,
      view = flipbook.turn('view');

    return (flipbook.turn('display')=='double' && (!view[0] || !view[1])) ?
      flipbook.width()/2
      :
      flipbook.width();

  },

  resize: function() {

    var data = this.data().zoom,
      flip = data.opts.flipbook;
    
    if (this.zoom('value')>1) {

      var  flipOffset = flip.offset(),
        thisOffset = this.offset();

      data.axis =  point2D(
        (flipOffset.left - thisOffset.left) + (data.axis.x + data.scrollPos.x),
        (flipOffset.top - thisOffset.top) + (data.axis.y + data.scrollPos.y)
      );

      if (flip.turn('display')=='double' &&
        flip.turn('direction')=='ltr' &&
        !flip.turn('view')[0])
          data.axis.x = data.axis.x + flip.width()/2;

      this.zoom('scroll', data.scrollPos);
    }

  },
  
};

function isPage(element, last) {

  if (element[0]==last[0])
    return false;

  if (element.attr('page'))
    return true;
  
  return (element.parent()[0]) ?
    isPage(element.parent(), last)
    :
  false;

}

function error(message) {

  function TurnJsError(message) {
    this.name = "TurnJsError";
    this.message = message;
  }

  TurnJsError.prototype = new Error();
  TurnJsError.prototype.constructor = TurnJsError;
  return new TurnJsError(message);

}

function translate(x, y, use3d) {
  
  return (has3d && use3d) ? ' translate3d(' + x + 'px,' + y + 'px, 0px) '
  : ' translate(' + x + 'px, ' + y + 'px) ';

}

function scale(v, use3d) {
  
  return (has3d && use3d) ? ' scale3d(' + v + ', ' + v + ', 1) '
  : ' scale(' + v + ') ';

}

function point2D(x, y) {
  
  return {x: x, y: y};

}

function bind(func, context) {

  return function() {
    return func.apply(context, arguments);
  };

}
})(jQuery);
