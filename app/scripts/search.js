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

    this.bind();

    return Search;
};

/**
* Вызываем методы конструктора Search
**/
Search.prototype.bind = function () {
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
    let check = debounce(() => {
        this.constructPopup();

            if (this.input.value.length > 0) {
                this.deleteBtn.classList.add('search__delete_active');
                this.searchBtn.classList.add('search__submit_active');
            } else {
                this.deleteBtn.classList.remove('search__delete_active');
                this.searchBtn.classList.remove('search__submit_active');
            }
        }, 250);

    this.input.addEventListener('input', check);
};

/**
* Кнопка "очистить поле поиска"
**/
Search.prototype.deleteButton = function () {
    this.deleteBtn.addEventListener('click', () => {
        this.input.value = '';
        this.input.focus();
        this.deleteBtn.classList.remove('search__delete_active');
        this.searchBtn.classList.remove('search__submit_active');
        this.popup.classList.remove('search__results_active');
    });
};

/**
* Кнопка "найти"
* работает, если форма прошла валидацию, и
* по клику посылает аякс-запрос
**/
Search.prototype.searchButton = function () {
    this.searchBtn.addEventListener('click', e => {
        let isSearchPossible = this.searchBtn.classList.value.indexOf('search__submit_active');

        e.preventDefault();

        if (isSearchPossible === -1) {
            return;
        }

        this.sendAjax();
    });
};

/**
* Post запрос
**/
Search.prototype.sendAjax = function () {
    let xhttp = new XMLHttpRequest();
    let inputValue = this.input.value;
    let formId = this.form.id;

    xhttp.open("POST", "super-analytics.com", true);
    xhttp.send('formId=' + formId + '&query=' + inputValue);
};

/**
* Всплывашка: подставляем нужные значения url'а в результат:
* url целиком, имя хоста, url без протокола
**/
Search.prototype.constructPopup = function () {
    if (this.checkUrl(this.input.value)) {
        let url = document.createElement('a');
        url.href = this.input.value;
        let hostname = url.hostname;
        let protocol = url.protocol;
        let urlWithoutProtocol = url.href.substring(protocol.length + '//'.length);
        let site = 'http://super-analytics.com';

        [].slice.call(this.resultsItem).forEach(item => {
            let type = item.getAttribute('data-type');
            let hrefPart = site + '?suggestionType=' + type + '&query=';

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

            this.resultsWidth(item);
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
    let link = resultsItem.getElementsByClassName('results__link')[0];

    //возвращаем ширину ссылки к изначальному значению
    link.style.width = 'auto';

    let itemPaddingsWidth = parseInt(window.getComputedStyle(resultsItem).getPropertyValue('padding-left')) + parseInt(window.getComputedStyle(resultsItem).getPropertyValue('padding-right'));
    let fullWidth = Math.floor(resultsItem.offsetWidth - itemPaddingsWidth);
    let linkWidth = Math.ceil(link.offsetWidth);
    let wordWidth = Math.ceil(resultsItem.getElementsByClassName('results__word')[0].offsetWidth);
    let tipWidth = Math.ceil(resultsItem.getElementsByClassName('results__tip')[0].offsetWidth);
    let availableWidth = fullWidth - (wordWidth + tipWidth + 2);

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
    const reUrl = new RegExp("^" +
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

    [].slice.call(search).forEach(item => {
        return new Search(item);
    });
})(document.getElementsByClassName('j-search'));
