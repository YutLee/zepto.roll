(function($) {
    $.fn.wscroll = function(options) {
        var options = $.extend({}, options);
        var t = $(this),
            scroller = t.children('ul'),
            item = scroller.children(),
            itemClone = item,
            len = item.length,
            realLen = len,
            realIdx = 1,
            w = scroller.width(),
            curr = 0,
            arr = [], newArr,
            isEnd = true,
            isStart = false,
            isInit = true,
            speed = options.speed || 300,
            delay = (options.delay || 5000) + speed,
            autoPlay, ON = 'on', nav, em;

        t.css('overflow', 'hidden');

        if(len == 1) {
            return;
        }

        if(len == 2) {
            item.eq(1).clone().appendTo(scroller);
            len = 3;
            item = scroller.children();
        }

        nav = $('<div class="nav"></div>').appendTo(t);

        scroller.css({'display': '-webkit-box', '-webkit-transform': 'translate3d(0px, 0px, 0px)'});

        item.each(function(idx) {
            if(idx < realLen) {
                if(idx == 0) {
                    nav.append('<em class="' + ON + '"></em>');
                }else {
                    nav.append('<em></em>');
                }
            }
            var dx = idx * w;
            if(idx == len - 1) {
                dx = -w;
            }
            $(this).css({'-webkit-transform': 'translate(' + (-idx * 100) + '%, 0px) translate3d(' + dx + 'px, 0px, 0px)'});

            arr.push([idx, dx]);
        });

        em = nav.children();

        var startX, startY, moveX, moveY, oldX, isLeft = true, distanceX = 0, absDistanceX = 0, absDistanceY = 0;
        scroller.bind('touchstart', function(e) {
            isInit = false;
            var touches = e.changedTouches[0] || e.targetTouches[0] || e.touches[0];
            // e.stopPropagation(); 
            startX = touches.pageX;
            startY = touches.pageY;
            clearInterval(autoPlay);
            if(isEnd) {
                isStart = true;
                oldX = parseInt(scroller.css('-webkit-transform').match(/\-?[0-9]+\.?[0-9]*/g)[1]);
                oldX = oldX - oldX % w;
            }
        }).bind('touchmove', function(e) {
            var touches = e.changedTouches[0] || e.targetTouches[0] || e.touches[0];
            moveX = touches.pageX;
            moveY = touches.pageY;
            distanceX = moveX - startX;
            absDistanceX = Math.abs(distanceX);
            absDistanceY = Math.abs(moveY - startY);
            if(isStart && isEnd) {
                if(distanceX > 0) {
                    isLeft = false;
                }else {
                    isLeft = true;
                }
                scroller.css({
                    '-webkit-transform': 'translate3d(' + (oldX + distanceX) + 'px, 0px, 0px)'
                });
            }
            if(absDistanceX > absDistanceY) {
                // e.stopPropagation();
                e.preventDefault();
            }
        }).bind('touchend', function(e) {
            var touches = e.changedTouches[0] || e.targetTouches[0] || e.touches[0];
            absDistanceX = Math.abs(touches.pageX - startX);
            absDistanceY = Math.abs(touches.pageY - startY);
            // e.stopPropagation();
            if(absDistanceX > 2 || absDistanceY > 2) {
                e.preventDefault();
                move();
            }
            if(options.isAuto) {
                autoPlay = setInterval(function() {
                    isStart = true;
                    oldX = parseInt(scroller.css('-webkit-transform').match(/\-?[0-9]+\.?[0-9]*/g)[1]);
                    oldX = oldX - oldX % w;
                    distanceX = 100;
                    move();
                }, delay);
            }
            isInit = true;
        });

        function move() {
            if(isStart) {
                isEnd = false;
                isStart = false;
                var x;

                function roll() {
                    var dx;
                    newArr = arr;
                    if(isLeft) {
                        x = oldX - w;
                        newArr.sort(function(a, b) {return a[1] - b[1];});
                        dx = newArr[len - 1][1] + w;
                        curr = newArr[2][0];
                        changeIdx = newArr[0][0];
                    }else {
                        x = oldX + w;
                        newArr.sort(function(a, b) {return b[1] - a[1];});
                        dx = newArr[len - 1][1] - w;
                        curr = newArr[len - 1][0];
                        changeIdx = newArr[0][0];
                    }
                    if(realLen == 2) {
                        curr = !realIdx ? 1 : 0;
                    }
                    item.eq(newArr[0][0]).css({'-webkit-transform': 'translate(' + (-arr[0][0] * 100) + '%, 0px) translate3d(' + dx + 'px, 0px, 0px)'});
                    newArr[0][1] = dx;
                    arr = newArr;
                }
                if(isInit) {
                    roll();
                }else {
                    if(absDistanceX < 50) {
                        x = oldX;
                    }else{
                        roll();
                    }
                }

                scroller.animate({
                    '-webkit-transform': 'translate3d(' + x + 'px, 0px, 0px)'
                }, speed, function() {
                    if(realLen > 2) {
                        realIdx = curr;
                    }
                    em.eq(realIdx).addClass(ON).siblings('.' + ON).removeClass(ON);
                    if(realLen == 2) {
                        realIdx = curr;
                        var style = item.eq(changeIdx).css('-webkit-transform');
                        item.eq(changeIdx).remove();
                        if(changeIdx == 2) {
                            itemClone.eq(curr).clone().css({'-webkit-transform': style}).appendTo(scroller);
                        }else if(changeIdx == 0) {
                            itemClone.eq(curr).clone().css({'-webkit-transform': style}).prependTo(scroller);
                        }else {
                            itemClone.eq(curr).clone().css({'-webkit-transform': style}).insertAfter(scroller.children().eq(0));
                        }
                        item = scroller.children();
                    }
                    isEnd = true;
                    if($.isFunction(options.callback)) {
                        options.callback.call(t, curr);
                    }
                });
            }
        }
        
        if(options.isAuto) {
            autoPlay = setInterval(function() {
                isStart = true;
                oldX = parseInt(scroller.css('-webkit-transform').match(/\-?[0-9]+\.?[0-9]*/g)[1]);
                oldX = oldX - oldX % w;
                distanceX = 100;
                move();
            }, delay);
        }

    };
})($);
