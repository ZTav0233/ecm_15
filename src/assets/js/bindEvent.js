
function bindEvent(element, eventName, eventHandler) {

            if (element.addEventListener) {

                element.addEventListener(eventName, eventHandler, false);

            } else if (element.attachEvent) {

                element.attachEvent('on' + eventName, eventHandler);

            }

        }
 bindEvent(document, 'message', function (e) {

            console.log(e.data);

        });
