requirejs.config({
    urlArgs: "ver=" + (new Date()).getTime(),
    baseUrl: "widget",
    paths: {
        main: "main",
        card: "js/card/cardTodo",
        popup: "js/popup/popup",
        luxon: "../vendor/js/luxon"
    },
    shim: {
    },
    map: {
    }
});

requirejs(['luxon', 'main'],
    function (luxon, main) {
        owfdojo.addOnLoad(function () {
            $(document).ready(function () {
                //window.Handlebars = handlebars;
                window.Luxon = luxon;

                // https://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
                Handlebars.registerHelper('ifCond', function (v1, v2, options) {
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                });
                Handlebars.registerHelper('ifCond2', function (v1, operator, v2, options) {

                    switch (operator) {
                        case '==':
                            return (v1 == v2) ? options.fn(this) : options.inverse(this);
                        case '===':
                            return (v1 === v2) ? options.fn(this) : options.inverse(this);
                        case '!=':
                            return (v1 != v2) ? options.fn(this) : options.inverse(this);
                        case '!==':
                            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                        case '<':
                            return (v1 < v2) ? options.fn(this) : options.inverse(this);
                        case '<=':
                            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                        case '>':
                            return (v1 > v2) ? options.fn(this) : options.inverse(this);
                        case '>=':
                            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                        case '&&':
                            return (v1 && v2) ? options.fn(this) : options.inverse(this);
                        case '||':
                            return (v1 || v2) ? options.fn(this) : options.inverse(this);
                        default:
                            return options.inverse(this);
                    }
                });

                // https://stackoverflow.com/questions/26715805/handlebarsjs-registerhelper-for-comparing-two-dates
                Handlebars.registerHelper("ifPassed", function (dueDate, matchDate, options) {
                    if (Luxon.DateTime.fromISO(dueDate).isAfter(Luxon.DateTime.fromISO(matchDate))) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                });

                // assign config to global window object
                window.Globals = main.Globals;

                var widget = new main.Widget();
                widget.initialize(main.CardTodo, main.Popup);
            });
        });
    }
);