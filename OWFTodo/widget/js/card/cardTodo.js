// widget object wrapper
define([], function () {
    // static variables

    // static objects

    var CardTodo = function () {
        // global class variables

        // interval/workers trackking

        // state object
        this._ready = false;

        // timer tracking

        // waiting image

        // widget elements
        this._source = null;
        this._template = null;

        // store for individual components
        this._store = {};
    }

    // ----- start ----- common card   functions ----- start ----
    CardTodo.prototype.isReady = function () {
        var self = this;

        return self._ready;
    }

    CardTodo.prototype.importCSS = function () {
        var self = this;
        var ver = "?ver=" + (new Date()).getTime();

        $('<link>')
            .appendTo('head')
            .attr({
                type: 'text/css',
                rel: 'stylesheet',
                href: 'widget/js/card/cardTodo.css' + ver
            });
    }

    CardTodo.prototype.importHTML = function () {
        var self = this;

        $.get("widget/js/card/cardTodo.html", function (response) {
            self._source = response;
            self._template = Handlebars.compile(self._source);

            self._ready = true;
        });
    }

    CardTodo.prototype.initialize = function () {
        var self = this;

        self.importCSS();
        self.importHTML();
    }

    CardTodo.prototype._updateEvents = function (options) {
        var self = this;

        // store all items and link click event to the todo
        var cards = $(".cardTodo-" + options.class);
        for (i = 0; i < cards.length; i++) {
            dataId = $(cards[i]).attr("data-id");
            self._store[options.class]["data"][dataId].element = $(cards[i])[0];

            // assign click to the main element
            if (options.callback) {
                cards[i].removeEventListener("click", options.callback);
                cards[i].addEventListener("click", options.callback);
            }
        }
    }

    CardTodo.prototype.create = function (data, options) {
        var self = this;

        // local variables
        var html = "";

        // create reference to the onClick for bind
        var i = 0,
            dataId = "";

        // if we are appending; then delete duplicates only else clear all
        $("#" + options.element).children().remove();
        $("#" + options.element).html("");

        self._store[options.class] = {};
        self._store[options.class]["data"] = {};
        self._store[options.class]["options"] = options;

        // initalize the object
        var replaceId = "";
        $.each(data, function (index, item) {
            item.cardId = i++;
            item.prefix = options.prefix;
            item.class = options.class;
            item.id = index;

            // fix the status based on due date
            if (((item.state === "Active") || (item.state === "OverDue")) &&
                item.due) {
                var diff = Luxon.DateTime.fromISO(item.due).diff(Luxon.DateTime.local());

                if (diff.values.milliseconds < 0) {
                    item.state = "OverDue";
                } else {
                    item.state = "Active";
                }
            }

            // get the populated template
            item.html = self._template(item);

            // append to others and update item in store
            html += item.html;
            self._store[options.class]["data"][index] = item;
        });

        // add to the document element
        $(html).appendTo($("#" + options.element));
        self._updateEvents(options);

        return self._store[options.class];
    }

    CardTodo.prototype.update = function (data, options) {
        var self = this;

        // local variables
        var html = "";

        // create reference to the onClick for bind
        var i = 0,
            dataId = "";

        // if we are appending; then delete duplicates only else clear all
        if (!self._store[options.class]) {
            console.log("Error - cannot update without create!!");
            return false;
        } else {
            // note on update/append primary options are used
            options = self._store[options.class]["options"];
        }

        // initalize the object
        var replaceId = "";
        $.each(data, function (index, item) {
            item.cardId = i++;
            item.prefix = options.prefix;
            item.class = options.class;
            item.id = index;

            // fix the status based on due date
            if (((item.state === "Active") || (item.state === "OverDue")) &&
                item.due) {
                var diff = Luxon.DateTime.fromISO(item.due).diff(Luxon.DateTime.local());

                if (diff.values.milliseconds < 0) {
                    item.state = "OverDue";
                } else {
                    item.state = "Active";
                }
            }

            item.html = self._template(item);

            // if item exists, then we need to replace
            if (self._store[options.class] && self._store[options.class]["data"] &&
                self._store[options.class]["data"][index]) {
                replaceId = $("#" + (options.prefix ? options.prefix : "todo") + "-" + index);
                $(replaceId[0]).replaceWith($(item.html));
            } else {
                html += item.html;
            }

            // update the store with new info
            self._store[options.class]["data"][index] = item;
        });

        // add to the document element
        $(html).appendTo($("#" + options.element));
        self._updateEvents(options);

        return true;
    }

    CardTodo.prototype.remove = function (data, options) {
        var self = this;

        // local variables

        // if we are appending; then delete duplicates only else clear all
        if (!self._store[options.class]) {
            console.log("Error - cannot remove without create!!");
            return false;
        } else {
            // note on update/append primary options are used
            options = self._store[options.class]["options"];
        }

        // find and remove the object
        var replaceId = "";
        $.each(data, function (index, item) {
            // if item exists, then we need to remove
            if (self._store[options.class] && self._store[options.class]["data"] &&
                self._store[options.class]["data"][item]) {
                replaceId = $("#" + (options.prefix ? options.prefix : "todo") + "-" + item);
                $(replaceId[0]).remove();
                delete self._store[options.class]["data"][item];
            }
        });

        return true;
    }
    // -----  end  ----- common card   functions -----  end  ----

    return CardTodo;
});