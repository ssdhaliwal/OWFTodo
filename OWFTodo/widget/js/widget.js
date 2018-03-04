// widget object wrapper
define([], function () {
    // static variables

    // static objects
    var Widget = function () {
        // global class variables
        this._Logger = OWF.Log.getDefaultLogger();
        this._LoggerAppender = this._Logger.getEffectiveAppenders()[0];

        // interval/workers trackking
        this._WidgetStateController = null;

        // user object
        this._config = Globals;
        this._User = {};
        this._settings = {
            state: {},
            todoData: {
                "1001": {
                    "category": "Daily",
                    "state": "Active",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: -1
                    }).toString("fff"),
                    "text": "todo-1001"
                },
                "1002": {
                    "category": "Weekly",
                    "state": "Complete",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: 4
                    }).toString("fff"),
                    "text": "todo-1002"
                },
                "1003": {
                    "category": "Weekly",
                    "state": "Active",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: 2
                    }).toString("fff"),
                    "text": "todo-1003"
                },
                "1004": {
                    "category": "Monthly",
                    "state": "Complete",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": null,
                    "text": "todo-1004"
                }
            },
            todoStore: {}
        };

        // timer tracking
        this._Interval = {};

        // OWF event subscriptions
        this._subscriptions = {
            todoMessageAdd: "todo.message.add",
            todoMessageRemove: "todo.message.remove"
        }

        // waiting image
        this._WaitingIcon = $("#waitingImage");

        // external objects
        this._cardTodo = null;
        this._popup = null;

        // widget elements
        this._dataDiv = $("#dataDiv");
        this._infoDiv = $("#infoDiv");

        // widget buttons
        this._btnTodoAdd = $("#mnuTodoAdd");
        this._btnTodoViewAll = $("#mnuTodoViewAll");
        this._btnTodoViewOpen = $("#mnuTodoViewOpen");
        this._btnTodoViewCompleted = $("#mnuTodoViewCompleted");
        this._btnAbout = $("#mnuAbout");
        this._btnReset = $("#mnuReset");
    }

    // ----- start ----- common widget functions ----- start ----
    // Enable logging
    Widget.prototype.setLogThreshold = function () {
        this._LoggerAppender.setThreshold(log4javascript.Level.INFO);
        OWF.Log.setEnabled(false);
    }

    // shared functions
    Widget.prototype.ajaxCall = function (url, data, callback, stateChange, type,
        contentType) {
        var self = this;

        // fix input vars if not defined
        if ((data === undefined) || (data === null) || (!data)) {
            data = {};
        }

        if ((callback === undefined) || (callback === null) || (!callback)) {
            callback = function () {};
        }

        if ((stateChange === undefined) || (stateChange === null) || (!stateChange)) {
            stateChange = function () {};
        }

        if ((type === undefined) || (type === null) || (!type)) {
            //default to a GET request
            type = "GET";
        }

        // initiate the call
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            stateChange({
                state: req.readyState,
                status: req.status
            });

            if (req.readyState === 4 && req.status === 200) {
                return callback(req.responseText);
            }
        };
        req.open(type, url, true);
        req.withCredentials = true;

        //req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        //req.setRequestHeader("Content-type", "application/json");
        if (!contentType) {
            req.setRequestHeader("Content-type", contentType);
        } else {
            req.setRequestHeader("Content-type", "text/plain");
        }

        if (type === "GET") {
            req.send();
        } else {
            req.send(JSON.stringify(data));
        }

        // return the object
        return req;
    }

    // document level events
    Widget.prototype.documentBindings = function () {
        var self = this;
        // prevent document to show contextmenu
        //$(document).bind("contextmenu",function(event)
        //{
        //  return false;
        //});

        // global resize event
        $(window).resize(function () {});

        // dropdown-menu checkmark option
        $("#groupCheckMenu > li > a").click(function (e) {
            $("#groupCheckMenu > li > a > span").removeClass("glyphicon-ok");
            $(this).find("span").addClass("glyphicon-ok");
        });
    }

    // component level events
    Widget.prototype.componentBindings = function () {
        var self = this;

        // detect change to navbar size

        // detect change to the div
        self._dataDiv.on("DOMNodeInserted DOMNodeRemoved", function () {
            self.scrollDataDivToBottom();
        });
        self._infoDiv.on("DOMNodeInserted DOMNodeRemoved", function () {
            self.scrollInfoDivToBottom();
        });

        // click handler for reset button
        self._btnTodoAdd.click(function () {
            self.onTodoAddClick();
        });
        self._btnTodoViewAll.click(function () {});
        self._btnTodoViewOpen.click(function () {});
        self._btnTodoViewCompleted.click(function () {});
        self._btnAbout.click(function () {
            self.getAbout();
        });
        self._btnReset.click(function () {
            self.clearReset();
        });
    }

    // configure the popup for alerts
    Widget.prototype.displayNotification = function (message, type, statusMessage) {
        var self = this;

        var d = new Date();
        var dtg = d.format(dateFormat.masks.isoTime);
        var msg = "";

        msg = dtg + ", " + type + ", " + message +
            ((statusMessage === undefined) ? "" : ", " + statusMessage) +
            "<br/>";
        $("#infoDiv").prepend(msg);

        if ((message !== undefined) && (message !== null) && (message.length !== 0)) {
            if ((type !== undefined) && (type !== null) && (type.length !== 0)) {
                $("#notification").css('color', 'white');

                msg = dtg + " " + message;

                $("#notification").html(msg);
                self.notifyInfo(msg, type);
            }
        }

        if ((statusMessage !== undefined) && (statusMessage !== null) &&
            (statusMessage.length !== 0)) {
            if ((type !== undefined) && (type !== null) && (type.length !== 0)) {
                if (type === "success") { // this._reen background-#DFF0D8
                    $("#notification").css('color', '#468847');
                } else if (type === "info") { // blue background-#D9EDF7
                    $("#notification").css('color', '#3A87AD');
                } else if (type === "warn") { // yellow background-#FCF8E3
                    $("#notification").css('color', '#C09853');
                } else if (type === "error") { // red background-#F2DEDE
                    $("#notification").css('color', '#B94A48');
                } else {
                    $("#notification").css('color', 'white');
                }
            }

            msg = dtg + " " + message + ", " + statusMessage;
            $("#notification").html(msg);

            if (type === "error") {
                self.notifyError(msg);
            } else {
                self.notifyInfo(msg, type);
            }
        }
    }

    // waiting image
    Widget.prototype.waitingStatus = function (state) {
        var self = this;

        if ((state !== undefined) && (state !== null) && (state.length !== 0)) {
            self._WaitingIcon.show();
        } else {
            self._WaitingIcon.hide();
        }
    }

    // main initialize and run functions for OWF
    Widget.prototype.shutdownWidget = function (sender, msg) {
        var self = this;

        // remove listener override to prevent looping
        self._WidgetStateController.removeStateEventOverrides({
            events: ["beforeclose"],
            callback: function () {
                // unsubcribe the events
                self.clearWidgetSubscriptions();

                // close widget
                self._WidgetStateController.closeWidget();
            }
        });
    }

    // initialize for class (fixes the html components)
    Widget.prototype.getState = function (key) {
        var self = this;

        return self._settings.state[key];
    }

    Widget.prototype.setState = function (key, value) {
        var self = this;

        if (self._settings.state[key]) {
            if (value) {
                self._settings.state[key] = value;
            } else {
                delete self._settings.state[key];
            }
        } else {
            self._settings.state[key] = value;
        }
    }

    Widget.prototype.initialize = function (CardTodo, Popup) {
        var self = this;

        // set initial state of the controls
        self.displayNotification("initializing widget", "info");

        // widget state controller
        self._WidgetStateController = Ozone.state.WidgetState.getInstance({
            widgetEventingController: Ozone.eventing.Widget.getInstance(),
            autoInit: true,

            // this is fired on any event that you are registered for.
            // the msg object tells us what event it was
            onStateEventReceived: function (sender, msg) {
                if (msg.eventName == "beforeclose") {
                    self.shutdownWidget(null, null);
                }
            }
        });

        self._WidgetStateController.addStateEventOverrides({
            events: ["beforeclose"]
        });

        // store params for later use
        self._config.params = {};
        self._config.params.CardTodo = CardTodo;
        self._config.params.Popup = Popup;

        // get user information
        Ozone.pref.PrefServer.getCurrentUser({
            onSuccess: owfdojo.hitch(self, "onGetUserInfoSuccess"),
            onFailure: owfdojo.hitch(self, "onGetUserInfoFailure")
        });
    }

    Widget.prototype.onGetUserInfoSuccess = function (userInfo) {
        var self = this;

        self._User["currentUserName"] = userInfo.currentUserName;
        self._User["currentUser"] = userInfo.currentUser;
        self._User["currentUserPrevLogin"] = userInfo.currentUserPrevLogin;
        self._User["currentId"] = userInfo.currentId;
        self._User["email"] = userInfo.email;

        // retrieve the user this.guid (or) create a new one on failure
        self._User["uuid"] = guid();
        self.getUserGroups();
    }

    Widget.prototype.onGetUserInfoFailure = function (error, status) {
        var self = this;

        console.log("No user info!", "error",
            "Got an error getting info! Status Code: " + status +
            ", Error message: " + error);

        self.displayNotification("No user info!", "error",
            "Got an error getting info! Status Code: " + status +
            ", Error message: " + error);
    }

    // get user Groups from OWF
    Widget.prototype.getUserGroups = function () {
        var self = this;

        self.displayNotification("retrieving user group info", "info");
        self.ajaxCall(self._config._owfInstance + "/owf/group?user_id=" + self._User.currentId,
            null,
            owfdojo.hitch(self, "onGetGroupSuccess"),
            null,
            null,
            "application/json");
    }

    Widget.prototype.onGetGroupSuccess = function (groupInfo) {
        var self = this;

        // convert the value to json object
        var value = JSON.parse(groupInfo);

        // store in array with user properties
        self._User.groups = [];
        $.each(value.data, function (index, item) {
            if (item.status === "active") {
                self._User.groups.push(item.name.toUpperCase());
            }
        });

        // fix for missing "OWF Users"
        if (groupExists("OWF USERS", self._User.groups).length === 0) {
            self._User.groups.push("OWF USERS");
        }

        // continue with initialization
        self.retrieveUserConfig();
        self.displayNotification("retrieving user group info complete", "info");
    }

    Widget.prototype.retrieveUserConfig = function () {
        var self = this;

        OWF.Preferences.getUserPreference({
            namespace: self._config._preferencesUser,
            name: 'uuid',
            onSuccess: owfdojo.hitch(self, "onGetUserConfigSuccess"),
            onFailure: owfdojo.hitch(self, "onGetUserConfigFailure")
        });
    }

    Widget.prototype.onGetUserConfigSuccess = function (pref) {
        var self = this;

        self._User["uuid"] = JSON.parse(pref.value);

        self.displayNotification("retrieving preferences", "info");
        self.retrievePreferences();
    }

    Widget.prototype.onGetUserConfigFailure = function (error, status) {
        var self = this;

        console.log("No default user config!", "error",
            "Got an error getting preferences! Status Code: " + status +
            ", Error message: " + error);
        self.displayNotification("No default user config!", "error",
            "Got an error getting preferences! Status Code: " + status +
            ", Error message: " + error);

        self.saveUserConfig();
    }

    Widget.prototype.saveUserConfig = function () {
        var self = this;

        OWF.Preferences.setUserPreference({
            namespace: self._config._preferencesUser,
            name: 'uuid',
            value: JSON.stringify(self._User["uuid"]),
            onSuccess: owfdojo.hitch(self, "onSetUserConfigSuccess"),
            onFailure: owfdojo.hitch(self, "onSetUserConfigFailure")
        });
    }

    Widget.prototype.onSetUserConfigSuccess = function (value) {
        var self = this;

        self.displayNotification("retrieving preferences", "info");
        self.retrievePreferences();
    }

    Widget.prototype.onSetUserConfigFailure = function (error, status) {
        var self = this;

        console.log("Error savings user UUID!", "error",
            "Got an error setting preferences! Status Code: " + status +
            ", Error message: " + error);
        self.displayNotification("Error savings user UUID!", "error",
            "Got an error setting preferences! Status Code: " + status +
            ", Error message: " + error);

        self.retrievePreferences();
    }

    // preferences
    Widget.prototype.savePreferences = function () {
        var self = this;

        var savedPrefs = {
            'opacity': self._ConfigOpacityValue,
            'zoom': self._InpCheckboxZoom.is(":checked"),
            'labels': self._InpCheckboxLabels.is(":checked"),
            'refresh': self._InpCheckboxRefresh.is(":checked"),
            'refreshTimeout': self._ConfigRefreshValue
        };

        OWF.Preferences.setUserPreference({
            namespace: self._config._preferencesStore,
            name: 'defaultConfig',
            value: JSON.stringify(savedPrefs),
            onSuccess: function () {},
            onFailure: owfdojo.hitch(self, "onSetPreferencesFailure")
        });
    }

    Widget.prototype.onSetPreferencesFailure = function (error, status) {
        var self = this;

        console.log("No default settings!", "error",
            "Got an error setting preferences! Status Code: " + status +
            ", Error message: " + error);
        self.displayNotification("No default settings!", "error",
            "Got an error setting preferences! Status Code: " + status +
            ", Error message: " + error);

            self.restoreSettings();
    }

    Widget.prototype.retrievePreferences = function () {
        var self = this;

        OWF.Preferences.getUserPreference({
            namespace: self._config._preferencesStore,
            name: 'defaultConfig',
            onSuccess: owfdojo.hitch(self, "onGetPreferencesSuccess"),
            onFailure: owfdojo.hitch(self, "onGetPreferencesFailure")
        });
    }

    Widget.prototype.onGetPreferencesSuccess = function (pref) {
        var self = this;

        /*
        var savedPrefs = JSON.parse(pref.value);

        self._ConfigOpacityValue = savedPrefs.opacity;
        self._ConfigRefreshValue = savedPrefs.refreshTimeout;
        self._InpCheckboxZoom.prop("checked", savedPrefs.zoom);
        self._InpCheckboxLabels.prop("checked", savedPrefs.labels);
        self._InpCheckboxRefresh.prop("checked", savedPrefs.refresh);

        self._InpSliderRefresh.enable(self._InpCheckboxRefresh.is(":checked"));
        */
        self.restoreSettings();
    }

    Widget.prototype.onGetPreferencesFailure = function (error, status) {
        var self = this;

        console.log("No default settings!", "error",
            "Got an error getting preferences! Status Code: " + status +
            ", Error message: " + error);
        self.displayNotification("No default settings!", "error",
            "Got an error getting preferences! Status Code: " + status +
            ", Error message: " + error);

        self.restoreSettings();
    }

    Widget.prototype.saveSettings = function (listViewNodeId) {
        var self = this;

        // save the preference split in 2K length
        var data = JSON.stringify(self._settings);
        var dataArray = data.match(/.{1,2000}/g);

        // save header count
        OWF.Preferences.setUserPreference({
            namespace: self._config._preferencesStore,
            name: 'settings_length',
            value: dataArray.length,
            onSuccess: function () {},
            onFailure: owfdojo.hitch(self, "onSaveSettingFailure")
        });

        // save data
        $.each(dataArray, function (index, item) {
            OWF.Preferences.setUserPreference({
                namespace: self._config._preferencesStore,
                name: 'settings_' + index,
                value: item,
                onSuccess: function () {},
                onFailure: owfdojo.hitch(self, "onSaveSettingFailure")
            });
        });
    }

    Widget.prototype.onSaveSettingFailure = function (errorMessage) {
        var self = this;

        self.displayNotification(null, "error", "Settings Save Failure: " + errorMessage);
    }

    Widget.prototype.restoreSettings = function () {
        var self = this;

        // retrieve header count
        OWF.Preferences.getUserPreference({
            namespace: self._config._preferencesStore,
            name: 'settings_length',
            onSuccess: owfdojo.hitch(self, "onRestoreSettingSuccess"),
            onFailure: owfdojo.hitch(self, "onRestoreSettingFailure")
        });
    }

    Widget.prototype.onRestoreSettingSuccess = function (pref) {
        var self = this;

        self._settingRestoreLength = parseInt(pref.value);
        self._settingRestoreData = "";

        // if length == 0 then exit
        if ((isNaN(self._settingRestoreLength)) || (self._settingRestoreLength === 0)) {
            // activate controls
            self.activateControls();
        } else {
            // retrieve data
            self._settingRestoreIndex = 0;
            OWF.Preferences.getUserPreference({
                namespace: self._config._preferencesStore,
                name: 'settings_' + self._settingRestoreIndex,
                onSuccess: owfdojo.hitch(self, "onRestoreSettingDataSuccess"),
                onFailure: owfdojo.hitch(self, "onRestoreSettingFailure")
            });
        }
    }

    Widget.prototype.onRestoreSettingDataSuccess = function (pref) {
        var self = this;

        // store the data and continue if not complete
        self._settingRestoreData += pref.value;

        self._settingRestoreIndex++;
        if (self._settingRestoreIndex >= self._settingRestoreLength) {
            // update the favories from string
            self._SettingServiceCollection = JSON.parse(self._settingRestoreData);

            // activate controls
            self.activateControls();
        } else {
            OWF.Preferences.getUserPreference({
                namespace: self._config._preferencesStore,
                name: 'settings_' + self._settingRestoreIndex,
                onSuccess: owfdojo.hitch(self, "onRestoreSettingDataSuccess"),
                onFailure: owfdojo.hitch(self, "onRestoreSettingFailure")
            });
        }
    }

    Widget.prototype.onRestoreSettingFailure = function (errorMessage) {
        var self = this;

        self.displayNotification(null, "error", "Settings Restore Failure: " + errorMessage);

        // activate controls
        self.activateControls();
    }

    Widget.prototype.activateControls = function () {
        var self = this;

        // initialize external objects
        self._cardTodo = new self._config.params.CardTodo();
        self._cardTodo.initialize();

        self._popup = new self._config.params.Popup();
        self._popup.initialize();

        // wait for card library to be loaded
        // use below code to make sure document is fully loaded due to template
        // loading javascript before the entire page is loaded
        self.owner = this;
        self._Interval.t1 = setInterval(function () {
            if (!self._cardTodo.isReady())
                return;
            if (!self._popup.isReady())
                return;

            clearInterval(self._Interval.t1);
            self.waitingStatus();

            // register all document/component event bindings
            self.documentBindings();
            self.componentBindings();
            self.setWidgetSubscriptions();

            self.loadCards();

            // notify widget is ready
            OWF.notifyWidgetReady();
            self.displayNotification("widget initialization complete", "info");
            self.waitingStatus();

            // function to prevent session timeouts from idle
            setInterval(function () {
                var ver = "ver=" + (new Date()).getTime();

                $("#waitingImageIcon").prop("src", "widget/images/loading_blue.gif?" + ver)
            }, 100000);
        }, 1000);
    }

    Widget.prototype.loadCards = function () {
        var self = this;

        // display the base OWF info
        $("#cardTodoWrapper").remove();

        var count = 0;
        var tmpDiv = $('<div id="cardTodoWrapper"><b>OWF Info: </b><br/><div id="cardTodoInfo" class="cardInfo"></div><br/><hr/></div>');
        tmpDiv.appendTo(self._dataDiv);
        self._settings.todoStore = self._cardTodo.create(self._settings.todoData, {
            "prefix": "mytodo",
            "class": "mytodos",
            "element": "dataDiv",
            "callback": self.onTodoEditClick.bind(self)
        });

        var tTimer1 = setInterval(function () {
            clearInterval(tTimer1);

            self._cardTodo.update({
                "1001": {
                    "category": "Daily",
                    "state": "Active",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: -1
                    }).toString("fff"),
                    "text": "todo-1001-updated"
                },
                "1008": {
                    "category": "Weekly",
                    "state": "Complete",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: 4
                    }).toString("fff"),
                    "text": "todo-1008"
                }
            }, {
                "class": "mytodos",
            });
        }, 5000);

        var tTimer2 = setInterval(function () {
            clearInterval(tTimer2);

            self._cardTodo.update({
                "1008": {
                    "category": "Daily",
                    "state": "Active",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: -1
                    }).toString("fff"),
                    "text": "todo-1008-updated"
                }
            }, {
                "class": "mytodos",
            });
        }, 10000);

        var tTimer3 = setInterval(function () {
            clearInterval(tTimer3);

            self._cardTodo.remove([
                "1002", "1004"
            ], {
                "class": "mytodos",
            });
        }, 15000);

        var tTimer4 = setInterval(function () {
            clearInterval(tTimer4);

            self._cardTodo.update({
                "1002": {
                    "category": "Weekly",
                    "state": "Complete",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": Luxon.DateTime.local().plus({
                        days: 4
                    }).toString("fff"),
                    "text": "todo-1002"
                },
                "1004": {
                    "category": "Monthly",
                    "state": "Complete",
                    "created": Luxon.DateTime.local().toString("fff"),
                    "due": null,
                    "text": "todo-1004"
                }
            }, {
                "class": "mytodos",
            });
        }, 20000);

        // link add to click event
        //$("#todoAdd")[0].addEventListener("click", self.onTodoAddClick.bind(self));
    }

    Widget.prototype.notifyError = function (msg) {
        $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            message: msg
        }, {
            element: 'body',
            type: "error",
            allow_dismiss: true,
            placement: {
                from: "top",
                align: "right"
            },
            z_index: 1031
        });
    };

    Widget.prototype.notifyInfo = function (msg, type) {
        $.notify({
            icon: 'glyphicon glyphicon-warning-sign',
            message: msg
        }, {
            element: 'body',
            type: type,
            allow_dismiss: true,
            placement: {
                from: "top",
                align: "right"
            },
            z_index: 1031,
            delay: 5000,
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                '<img data-notify="icon" class="img-circle pull-left">' +
                '<span data-notify="title">{1}</span>' +
                '<span data-notify="message">{2}</span>' +
                '</div>'
        });
    };
    // -----  end  ----- common widget functions -----  end  ----

    // ----- start ----- widget MSG functions    ----- start ----
    Widget.prototype.clearWidgetSubscriptions = function () {
        var self = this;

        // for all subscriptions - remove subscription
        $.each(self._subscriptions, function (index, item) {
            OWF.Eventing.unsubscribe(item);
        });
    }

    Widget.prototype.sendStatusInitialization = function (status, payload) {
        var self = this;

        // format channel message
        var message = {
            "status": status
        };
        if (!payload) {
            message["payload"] = payload;
        }

        // send message
        self.sendChannelMessage("todo.status.initialization", message);
    }

    Widget.prototype.sendChannelMessage = function (channel, message) {
        OWF.Eventing.publish(channel, JSON.stringify(message));
    };

    Widget.prototype.sendErrorMessage = function (sender, type, message, error) {
        var result = {
            "sender": sender,
            "type": type,
            "message": message,
            "error": error
        }

        OWF.Eventing.publish("todo.error", JSON.stringify(result));
    };

    Widget.prototype.setWidgetSubscriptions = function () {
        var self = this;

        OWF.Eventing.subscribe(self._subscriptions.todoMessageAdd,
            owfdojo.hitch(self, "onRecvTodoMessageAdd"));

        OWF.Eventing.subscribe(self._subscriptions.todoMessageRemove,
            owfdojo.hitch(self, "onRecvTodoMessageRemove"));
    }

    Widget.prototype.onRecvTodoMessageAdd = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
        self._cardTodo.update(payload);
    }

    Widget.prototype.onRecvTodoMessageRemove = function (sender, message) {
        var self = this;

        var payload = JSON.parse(message);
        self._cardTodo.remove(payload);
    }
    // -----  end  ----- widget MSG    functions -----  end  ----

    // ----- start ----- widget UI functions     ----- start ----
    Widget.prototype.clearReset = function () {
        var self = this;

        // clear current info
        self._settings.state = {};
        self._dataDiv.text("");

        // clear all event handlers
        //$("body").off("click", ".owfInfoClass");

        // update button status
        self.disableButtons();
    }

    Widget.prototype.enableButtons = function () {
        var self = this;

        self._btnUserUUID.removeClass("disabled");
    }

    Widget.prototype.disableButtons = function () {
        var self = this;

        self._btnUserUUID.addClass("disabled");
    }

    Widget.prototype.scrollDataDivToBottom = function () {
        var self = this;

        self._dataDiv.scrollTop(self._dataDiv[0].scrollHeight);
    }

    Widget.prototype.scrollDataDivToTop = function () {
        var self = this;

        self._dataDiv.scrollTop(0);
    }

    Widget.prototype.scrollInfoDivToBottom = function () {
        var self = this;

        self._infoDiv.scrollTop(self._infoDiv[0].scrollHeight);
    }

    Widget.prototype.scrollInfoDivToTop = function () {
        var self = this;

        self._infoDiv.scrollTop(0);
    }
    // -----  end  ----- widget UI functions     -----  end  ----

    // ----- start ----- widget functions        ----- start ----
    Widget.prototype.onTodoAddClick = function (event) {
        var self = this;

        self._popup.create({
            "id": "popupTodoEdit",
            "header": "Add new item...",
            "footer": undefined,
        }, {
            element: "todoPopup",
            callback: self.onPopupCallbackAdd.bind(self)
        });
    }

    Widget.prototype.onTodoEditClick = function (event) {
        var self = this;

        // retrieve the target for the child
        var target = $(event.target);
        var editTodo = false;

        // if child element is clicked; bubble up to the parent as target
        if (!target.hasClass(".cardTodo")) {
            if (target.is("i")) {
                editTodo = true;
            }

            target = target.closest(".cardTodo");
        }

        self._infoDiv.prepend(".. clicked: " + editTodo + ", " + target[0].id + ", " + $(target).data("id") + "<br/>");

        // if not edit - then check mark changed
        if (!editTodo) {
            var panel = target.children().first();
            var dataId = $(target).data("id");

            if ((target.hasClass("cardTodo-Active")) ||
                (target.hasClass("cardTodo-OverDue"))) {
                target.removeClass("cardTodo-Active");
                target.removeClass("cardTodo-OverDue");
                target.addClass("cardTodo-Complete");

                $(panel[0]).prop('checked', true);
                self._settings.todoStore["data"][dataId].state = "Complete";
            } else {
                target.removeClass("cardTodo-Complete");

                // check if date is overdue
                if (self._settings.todoStore["data"][dataId].due) {
                    var diff = Luxon.DateTime.fromISO(self._settings.todoStore["data"][dataId].due).diff(Luxon.DateTime.local());
                    if (diff.values.milliseconds < 0) {
                        target.addClass("cardTodo-OverDue");
                        self._settings.todoStore["data"][dataId].state = "OverDue";
                    } else {
                        target.addClass("cardTodo-Active");
                        self._settings.todoStore["data"][dataId].state = "Active";
                    }
                } else {
                    target.addClass("cardTodo-Active");
                    self._settings.todoStore["data"][dataId].state = "Active";
                }

                $(panel[0]).prop('checked', false);
            }
        } else {
            self._popup.create({
                "id": "popupTodoEdit",
                "header": "Edit item (#" + target[0].id + ")",
                "footer": undefined,
            }, {
                element: "todoPopup",
                callback: self.onPopupCallbackAdd.bind(self)
            });
        }
        /*
        var dataId = $(event[0]).attr("data-id");
        var panel = $(event[0]).children();
        var item = self._cardTodo._data[dataId];

        console.log("onTodoEditClick", event, dataId, self._cardTodo._data[dataId], panel);
        //$.each(panel, function(index, item) {
        //    console.log(index, item);
        //    
        //    if ($(item).hasClass("cardTodo-text")) {
        //        console.log("1001-01");
        //        $(item).html("new item");
        //    }
        //});

        //$(event[0]).removeClass("cardTodo-Complete");
        //$(event[0]).removeClass("cardTodo-Active");
        //$(event[0]).addClass("cardTodo-OverDue");
        //$(panel[0]).prop("checked", true);
        */
    }

    Widget.prototype.onPopupCallbackAdd = function (event) {
        var self = this;

        console.log("onPopupCallbackAdd", event);
    }

    Widget.prototype.onPopupCallbackEdit = function (event) {
        var self = this;

        console.log("onPopupCallbackEdit", event);
    }

    Widget.prototype.getAbout = function () {
        var self = this;

        $.notify({
            icon: 'glyphicon glyphicon-info-sign',
            message: ""
        }, {
            element: 'body',
            type: "info",
            allow_dismiss: true,
            showProgressbar: true,
            placement: {
                from: "top",
                align: "right"
            },
            z_index: 1031,
            delay: 5000,
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">×</button>' +
                '<div style="text-align:center;"><h2>OWF Base Widget</h2></div>' +
                '<hr/>' +
                '<div style="text-align:center;"><p>Version 1.01</p></div>' +
                '<div style="text-align:center;"><h3>Dependencies</h3></div>' +
                '<ul>' +
                '<li>Dojo, Handlebars</li>' +
                '<li>JQuery, Lodash</li>' +
                '<li>Luxon, Notify</li>' +
                '<li>OWF</li></ul>' +
                '<br/>' +
                '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                '</div>' +
                '</div>'
        });
    }
    // -----  end  ----- widget functions        -----  end  ----

    return Widget;
});