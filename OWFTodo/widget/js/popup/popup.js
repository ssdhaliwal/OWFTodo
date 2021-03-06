// widget object wrapper
define([], function () {
    // static variables

    // static objects

    var Popup = function () {
        // global class variables

        // interval/workers trackking

        // state object
        this._ready = false;

        // timer tracking

        // waiting image

        // widget elements
        this._source = null;
        this._template = null;
    }

    // ----- start ----- common card   functions ----- start ----
    Popup.prototype.isReady = function () {
        var self = this;

        return self._ready;
    }

    Popup.prototype.importCSS = function () {
        var self = this;

        $('<link>')
            .appendTo('head')
            .attr({
                type: 'text/css',
                rel: 'stylesheet',
                href: 'widget/js/popup/popup.css'
            });
    }

    Popup.prototype.importHTML = function (data) {
        var self = this;

        $.get("widget/js/popup/popup.html", function (response) {
            self._source = response;
            self._template = Handlebars.compile(self._source);

            self._ready = true;
        });
    }

    Popup.prototype.initialize = function () {
        var self = this;

        self.importCSS();
        self.importHTML();

        return self;
    }

    Popup.prototype.create = function (data, options) {
        var self = this;

        // initalize the object
        self._data = data.popup;
        var html = self._template(self._data);

        // add to the document element
        $(html).appendTo($("#" + options.element));

        // create form and link it
        $("#popoup-form").alpaca({
            "data": data.form,
            "schema": {
                "title": "Todo Form",
                "description": "Enter/Edit todo items...",
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "title": "Text",
                        "required": true
                    },
                    "state": {
                        "type": "string",
                        "title": "State",
                        "enum": ["Active", "OverDue", "Completed", "Cancelled"],
                        "required": true
                    },
                    "schedule": {
                        "type": "string",
                        "enum": ["No Schedule", "Hourly", "Daily", "Weekly", "Monthly"],
                        "required": true,
                        "default": "No Schedule"
                    },
                    "scheduleHourly": {
                        "title": "Dependent Field (Hourly)",
                        "type": "object",
                        "properties": {
                            "hourStart": {
                                "minimum": 0,
                                "maximum": 24,
                                "title": "Start"
                            },
                            "hourStop": {
                                "minimum": 0,
                                "maximum": 24,
                                "title": "Stop"
                            }
                        }
                    },
                    "scheduleDaily": {
                        "type": "array",
                        "items": {
                            "title": "Dependent Field (Daily)",
                            "type": "string",
                            "enum": ["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
                        },
                        "minItems": 1,
                        "maxItems": 7
                    },
                    "scheduleWeekly": {
                        "type": "array",
                        "items": {
                            "title": "Dependent Field (Weekly)",
                            "type": "string",
                            "enum": ["Weekly", "First Week", "Second Week", "Third Week", "Fourth Week",
                                "Fifth Week", "Last Week"
                            ]
                        },
                        "minItems": 1,
                        "maxItems": 5
                    },
                    "scheduleMonthly": {
                        "type": "array",
                        "items": {
                            "title": "Dependent Field (Monthly)",
                            "type": "string",
                            "enum": ["Monthly", "Quarterly",
                                "First Day of Month", "First Day of Quarter",
                                "First Day of Even Month", "First of Odd Month",
                                "Last Day of Month", "Last Day of Quarter",
                                "Last Day of Even Month", "Last of Odd Month",
                                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                            ]
                        },
                        "minItems": 1,
                        "maxItems": 5
                    },
                    "ArrayOfFields": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "scheduleInArray": {
                                    "type": "string",
                                    "enum": ["No Schedule", "Hourly", "Daily", "Weekly", "Monthly"],
                                    "required": true,
                                    "default": "No Schedule"
                                },
                                "scheduleInArrayHourly": {
                                    "title": "Dependent Field In Array (Hourly)",
                                    "type": "object",
                                    "properties": {
                                        "hourStart": {
                                            "minimum": 0,
                                            "maximum": 24,
                                            "title": "Start"
                                        },
                                        "hourStop": {
                                            "minimum": 0,
                                            "maximum": 24,
                                            "title": "Stop"
                                        }
                                    }
                                },
                                "scheduleInArrayDaily": {
                                    "type": "array",
                                    "items": {
                                        "title": "Dependent Field (Daily)",
                                        "type": "string",
                                        "enum": ["Sunday", "Monday", "Tuesday", "Wednessday", "Thursday", "Friday", "Saturday"]
                                    },
                                    "minItems": 1,
                                    "maxItems": 7
                                },
                                "scheduleInArrayWeekly": {
                                    "type": "array",
                                    "items": {
                                        "title": "Dependent Field (Weekly)",
                                        "type": "string",
                                        "enum": ["Weekly", "First Week", "Second Week", "Third Week", "Fourth Week",
                                            "Fifth Week", "Last Week"
                                        ]
                                    },
                                    "minItems": 1,
                                    "maxItems": 5
                                },
                                "scheduleInArrayMonthly": {
                                    "type": "array",
                                    "items": {
                                        "title": "Dependent Field (Monthly)",
                                        "type": "string",
                                        "enum": ["Monthly", "Quarterly",
                                            "First Day of Month", "First Day of Quarter",
                                            "First Day of Even Month", "First of Odd Month",
                                            "Last Day of Month", "Last Day of Quarter",
                                            "Last Day of Even Month", "Last of Odd Month",
                                            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
                                        ]
                                    },
                                    "minItems": 1,
                                    "maxItems": 5
                                }
                            },
                            "dependencies": {
                                "scheduleInArrayHourly": ["scheduleInArray"],
                                "scheduleInArrayDaily": ["scheduleInArray"],
                                "scheduleInArrayWeekly": ["scheduleInArray"],
                                "scheduleInArrayMonthly": ["scheduleInArray"]
                            }
                        }
                    },
                    "duedate": {
                        "type": "string",
                        "required": false,
                        "properties": {}
                    }
                },
                "dependencies": {
                    "scheduleHourly": ["schedule"],
                    "scheduleDaily": ["schedule"],
                    "scheduleWeekly": ["schedule"],
                    "scheduleMonthly": ["schedule"]
                }
            },
            "options": {
                "form": {
                    "attributes": {
                        "action": "http://{your_url_here}/post",
                        "method": "post"
                    },
                    "buttons": {
                        "submit": {
                            "title": "Send Form Data",
                            "click": function () {
                                var val = this.getValue();
                                if (this.isValid(true)) {
                                    console.log("Valid value: " + JSON.stringify(val, null, "  "));
                                    options.callback(val);
                                    self.onClick();
                                } else {
                                    console.log("Invalid value: " + JSON.stringify(val, null, "  "));
                                }
                            }
                        }
                    }
                },
                "helper": "Tell us what you think about Alpaca!",
                "fields": {
                    "text": {
                        "size": 80,
                        "helper": "Please enter todo item."
                    },
                    "state": {
                        "type": "select",
                        "helper": "Select state of the todo item!",
                        "optionLabels": ["Active",
                            "Over-Due",
                            "Complete",
                            "Cancelled"
                        ],
                        "sort": false
                    },
                    "scheduleHourly": {
                        "dependencies": {
                            "schedule": "Hourly"
                        },
                        "fields": {
                            "hourStart": {
                                "type": "number"
                            },
                            "hourStop": {
                                "type": "number"
                            }
                        }
                    },
                    "scheduleDaily": {
                        "dependencies": {
                            "schedule": "Daily"
                        },
                        "label": "Daily Schedule",
                        "helper": "Select days to schedule?",
                        "type": "select",
                        "size": 5,
                        "noneLabel": "No days selected?",
                        "sort": false
                    },
                    "scheduleWeekly": {
                        "dependencies": {
                            "schedule": "Weekly"
                        },
                        "label": "Weekly Schedule",
                        "helper": "Select weeks to schedule?",
                        "type": "select",
                        "size": 5,
                        "noneLabel": "No weeks selected?",
                        "sort": false
                    },
                    "scheduleMonthly": {
                        "dependencies": {
                            "schedule": "Monthly"
                        },
                        "label": "Monthly Schedule",
                        "helper": "Select months to schedule?",
                        "type": "select",
                        "size": 5,
                        "noneLabel": "No months selected?",
                        "sort": false
                    },
                    "ArrayOfFields": {
                        "fields": {
                            "item": {
                                "fields": {
                                    "scheduleInArray": {
                                        "vertical": true
                                    },
                                    "scheduleInArrayHourly": {
                                        "dependencies": {
                                            "scheduleInArray": "Hourly"
                                        },
                                        "fields": {
                                            "hourStart": {
                                                "type": "number"
                                            },
                                            "hourStop": {
                                                "type": "number"
                                            }
                                        }
                                    },
                                    "scheduleInArrayDaily": {
                                        "dependencies": {
                                            "scheduleInArray": "Daily"
                                        },
                                        "label": "Daily Schedule",
                                        "helper": "Select days to schedule?",
                                        "type": "select",
                                        "size": 5,
                                        "noneLabel": "No days selected?",
                                        "sort": false
                                    },
                                    "scheduleInArrayWeekly": {
                                        "dependencies": {
                                            "scheduleInArray": "Weekly"
                                        },
                                        "label": "Weekly Schedule",
                                        "helper": "Select weeks to schedule?",
                                        "type": "select",
                                        "size": 5,
                                        "noneLabel": "No weeks selected?",
                                        "sort": false
                                    },
                                    "scheduleInArrayMonthly": {
                                        "dependencies": {
                                            "scheduleInArray": "Monthly"
                                        },
                                        "label": "Monthly Schedule",
                                        "helper": "Select months to schedule?",
                                        "type": "select",
                                        "size": 5,
                                        "noneLabel": "No months selected?",
                                        "sort": false
                                    }
                                }
                            }
                        }
                    },
                    "duedate": {
                        "type": "datetime",
                        "label": "Due date",
                        "helpers": [],
                        "validate": true,
                        "disabled": false,
                        "showMessages": true,
                        "renderButtons": true,
                        "data": {},
                        "attributes": {},
                        "allowOptionalEmpty": true,
                        "autocomplete": false,
                        "disallowEmptySpaces": false,
                        "disallowOnlyEmptySpaces": false,
                        "picker": {
                            "useCurrent": true,
                            "format": "DD/MM/YYYY HH:mm:ss",
                            "locale": "en_US",
                            "extraFormats": ["DD/MM/YYYY hh:mm:ss a"]
                        },
                        "dateFormat": "DD/MM/YYYY HH:mm:ss",
                        "manualEntry": false,
                        "fields": {}
                    }
                }
            },
            "view": {
                "parent": "bootstrap-edit"
            }
        });

        // link the close button to click event
        $(".popup-close")[0].addEventListener("click", self.onClick.bind(self));

        // show the popup
        $("#" + self._data.id)[0].style.display = "block";
    }

    Popup.prototype.onClick = function () {
        var self = this;

        //$("#" + self._data.id)[0].style.display = "none";
        $("#todoPopup").children().remove();
    }
    // -----  end  ----- common card   functions -----  end  ----

    return Popup;
});