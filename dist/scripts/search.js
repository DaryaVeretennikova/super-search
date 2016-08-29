'use strict';

/**
* Debounce: https://davidwalsh.name/javascript-debounce-function
**/

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
    };
};

/**
* Конструктор Search
**/

var Search = function Search(searchElem) {
    this.input = searchElem.getElementsByClassName('search__input')[0];
    this.deleteBtn = searchElem.getElementsByClassName('search__delete')[0];
    this.searchBtn = searchElem.getElementsByClassName('search__submit')[0];
    this.popup = searchElem.getElementsByClassName('search__results')[0];
    this.resultsItem = searchElem.getElementsByClassName('results__item');
    this.form = searchElem;

    this.checkInputValue();
    this.searchButton();
    this.deleteButton();
};

/**
* Проверка ввода значений каждые 250 мс в поисковое поле:
* конструируем "всплывашку"" и
* делаем простую валидацию на кол-во введенных символов
**/
Search.prototype.checkInputValue = function () {
    var this$1 = this;

    var check = debounce(function () {
        this$1.constructPopup();

            if (this$1.input.value.length > 0) {
                this$1.deleteBtn.classList.add('search__delete_active');
                this$1.searchBtn.classList.add('search__submit_active');
            } else {
                this$1.deleteBtn.classList.remove('search__delete_active');
                this$1.searchBtn.classList.remove('search__submit_active');
            }
        }, 250);

    this.input.addEventListener('input', check);
};

/**
* Кнопка "очистить поле поиска"
**/
Search.prototype.deleteButton = function () {
    var this$1 = this;

    this.deleteBtn.addEventListener('click', function () {
        this$1.input.value = '';
        this$1.input.focus();
        this$1.deleteBtn.classList.remove('search__delete_active');
        this$1.searchBtn.classList.remove('search__submit_active');
        this$1.popup.classList.remove('search__results_active');
    });
};

/**
* Кнопка "найти"
* работает, если форма прошла валидацию, и
* по клику посылает аякс-запрос
**/
Search.prototype.searchButton = function () {
    var this$1 = this;

    this.searchBtn.addEventListener('click', function (e) {
        var isSearchPossible = this$1.searchBtn.classList.value.indexOf('search__submit_active');

        e.preventDefault();

        if (isSearchPossible === -1) {
            return;
        }

        this$1.sendAjax();
    });
};

/**
* Post запрос
**/
Search.prototype.sendAjax = function () {
    var xhttp = new XMLHttpRequest();
    var inputValue = this.input.value;
    var formId = this.form.id;

    xhttp.open("POST", "super-analytics.com", true);
    xhttp.send('formId=' + formId + '&query=' + inputValue);
};

/**
* Всплывашка: подставляем нужные значения url'а в результат:
* url целиком, имя хоста, url без протокола
**/
Search.prototype.constructPopup = function () {
    var this$1 = this;

    if (this.checkUrl(this.input.value)) {
        var url = document.createElement('a');
        url.href = this.input.value;
        var hostname = url.hostname;
        var protocol = url.protocol;
        var urlWithoutProtocol = url.href.substring(protocol.length + '//'.length);
        var site = 'http://super-analytics.com';

        [].slice.call(this.resultsItem).forEach(function (item) {
            var type = item.getAttribute('data-type');
            var hrefPart = site + '?suggestionType=' + type + '&query=';

            if (type === 'phrase') {
                item.setAttribute('href', hrefPart + url.href);
                item.firstElementChild.innerHTML = url.href;
            } else if (type === 'domain') {
                item.setAttribute('href', hrefPart + hostname);
                item.firstElementChild.innerHTML = hostname;
            } else {
                item.setAttribute('href', hrefPart + urlWithoutProtocol);
                item.firstElementChild.innerHTML = urlWithoutProtocol;
            }

            this$1.resultsWidth(item);
        });

        this.popup.classList.add('search__results_active');
    } else {
        this.popup.classList.remove('search__results_active');
    }
};

/**
* Рассчитываем ширину ссылки во "всплывашке"
**/
Search.prototype.resultsWidth = function (resultsItem) {
    var link = resultsItem.getElementsByClassName('results__link')[0];

    //возвращаем ширину ссылки к изначальному значению
    link.style.width = 'auto';

    var itemPaddingsWidth = parseInt(window.getComputedStyle(resultsItem).getPropertyValue('padding-left')) + parseInt(window.getComputedStyle(resultsItem).getPropertyValue('padding-right'));
    var fullWidth = Math.floor(resultsItem.offsetWidth - itemPaddingsWidth);
    var linkWidth = Math.ceil(link.offsetWidth);
    var wordWidth = Math.ceil(resultsItem.getElementsByClassName('results__word')[0].offsetWidth);
    var tipWidth = Math.ceil(resultsItem.getElementsByClassName('results__tip')[0].offsetWidth);
    var availableWidth = fullWidth - (wordWidth + tipWidth + 2);

    if (linkWidth > availableWidth) {
        link.style.width = availableWidth.toString() + 'px';
        link.classList.add('results__link_hidden');
    } else {
        link.classList.remove('results__link_hidden');
    }
};

/**
* Проверка введенного значения в поле поиска на соответствие с url'ом
*/
Search.prototype.checkUrl = function (value) {
    var reUrl = new RegExp("^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)" +
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" + "(?:" +
    // IP address exclusion
    // private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" + "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" + "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" +
    // host name
    "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
    // domain name
    "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
    // TLD identifier
    "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
    // TLD may end with dot
    "\\.?" + ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:[/?#]\\S*)?" + "$", "i");
    return reUrl.test(value);
};

/**
* Создаем экземпляры объекта Search
*/
(function (search) {
    if (!search.length) {
        return;
    }

    [].slice.call(search).forEach(function (item) {
        return new Search(item);
    });
})(document.getElementsByClassName('j-search'));
