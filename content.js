let isCookieclicker = window.location.href.indexOf('orteil.dashnet.org/cookieclicker/') > 0

if (isCookieclicker) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('/include/page.js');
  s.async = false;
  s.onload = function() {
    this.parentNode.removeChild(this);
  };
  (document.head || document.documentElement).appendChild(s);
}

(function ($) {
  console.log("Auto Clicker Script Loaded.");

  $(document).ready(function () {
    var click_state = 'start';
    var acInterval;
    var pointerX = -1;
    var pointerY = -1;

    $(document).mouseover(function (event) {
      pointerX = event.pageX;
      pointerY = event.pageY;
    });

    $(document).on("keyup", function (e) {

      var code = e.keyCode || e.which;
      var ctrl = e.ctrlKey || e.metaKey;
      var key_1 = 188; // comma
      var key_2 = 190; // dot
      var key_3 = 191; // slash

      if (code == key_1 && ctrl) {
        click_state = 'start';
        if (click_state == 'start') {
          clickStart();
        }
      } else if (code == key_2 && ctrl) {
        click_state = 'stop';
        if (click_state == 'stop') {
          clickStop();
        }
      } else if (code == key_3 && ctrl) {
        alert('Cursor at - X:' + pointerX + ', Y:' + pointerY);
      }

    });

    $(document).on("click", '#btnStart', function (e) {
      click_state = 'start';
      clickStart();
    });

    $(document).on("click", '#btnStop', function (e) {
      click_state = 'stop';
      clickStop();
    });


    function clickStart() {
      chrome.storage.local.get("ac_storage", function (storage) {
        var ac_options = storage.ac_storage;

        if (ac_options !== null) {

          console.log("started");

          var click_interval = ac_options[0]['click_interval'];
          var click_unit = ac_options[0]['click_unit'];
          var click_button = ac_options[0]['click_button']; // left, right
          var click_type = ac_options[0]['click_type']; // click, dblclick
          var click_count = ac_options[0]['click_count'];
          var click_stop = ac_options[0]['click_stop'];
          var click_location = ac_options[0]['click_location'];
          var x_position = ac_options[0]['x_position'];
          var y_position = ac_options[0]['y_position'];

          var intervalTime = convertToMillisecs(click_interval, click_unit);

          if (click_stop == 0) {
            var count = click_count;
          } else {
            var count = 99999999999;
          }

          if (click_button == 'left') {
            var click_btn_type = click_type;
          } else {
            var click_btn_type = 'contextmenu';
          }

          $(".ac_active").removeClass("ac_active");
          $(":hover").last().addClass("ac_active");

          if (click_state == 'start') {
            if (click_location == 'cursor') {
              delayEvent(count, intervalTime, click_btn_type, ".ac_active");
            } else if (click_location == 'axis') {
              delayEvent(count, intervalTime, click_btn_type, null, x_position, y_position);
            }

          }


        }
      });
    }

    function clickStop() {
      click_state = 'stop';
      window.postMessage({
        type: 'bigCookieClickStop',
      })
      window.clearInterval(acInterval);
    }

    function setIntervalX(callback, delay, repetitions) {
      var x = 0;
      acInterval = window.setInterval(function () {

        callback();

        if (++x === repetitions) {
          window.clearInterval(acInterval);
        }
      }, delay);
    }

    function delayEvent(
      count = null,
      delay = null,
      click_event = null,
      target = null,
      x = null,
      y = null
    ) {
      var count = parseInt(count);
      var delay = parseInt(delay);
      var x = parseInt(x);
      var y = parseInt(y);

      if (target && isCookieclicker) {
        const t = $(target)[0]
        if (t.id === 'bigCookie') {
          window.postMessage({
            type: 'bigCookieClickStart',
            delay,
            count
          })
          return
        }
      }

      setIntervalX(function () {
        if (click_state !== 'stop') {
          if (target !== null) {
            clickEvent(target, click_event);
          } else if (x !== null || y !== null) {
            axisEvent(x, y, click_event);
          }
        }
      }, delay, count);
    }

    function clickEvent(target, click_event) {
      if ($(target).length > 0) {
        $(target).each(function () {
          var event = new MouseEvent(click_event);
          this.dispatchEvent(event);

          if (click_event === 'click') {
            this.dispatchEvent(new MouseEvent('mousedown'))
            this.dispatchEvent(new MouseEvent('mouseup'))
          }
        });
      }
    }

    function axisEvent(x, y, click_event) {
      if (x !== null || y !== null) {
        var event = new MouseEvent(click_event);
        var axis = document.elementFromPoint(x, y);
        axis.dispatchEvent(event);
        console.log(axis);
      }
    }

    function convertHoursToMillisecs(hours) {
      return Math.floor(hours * 60 * 60 * 1000);
    }

    function convertMinsToMillisecs(minutes) {
      return Math.floor(minutes * 60 * 1000);
    }

    function convertSecsToMillisecs(seconds) {
      return Math.floor(seconds * 1000);
    }

    function convertToMillisecs(time, unit) {
      let output;
      if (unit == 'hrs') {
        output = convertHoursToMillisecs(time);
      } else if (unit == 'mins') {
        output = convertMinsToMillisecs(time);
      } else if (unit == 'secs') {
        output = convertSecsToMillisecs(time);
      } else if (unit == 'millisecs') {
        output = Math.floor(time);
      }
      return output;
    }

  });

})(jQuery);
