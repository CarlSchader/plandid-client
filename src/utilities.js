import axios from 'axios';
import _ from "lodash"
import config from './config';
import { DateTime } from 'luxon';

function eventFire(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

function randomColor(seed=null) {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
}

function pathLowestLevel(path) {
    let index = path.indexOf('/', 1);
    return index !== -1 ? path.substring(0, index + 1) : path;
}

function invert(obj) {
    return _.invert(obj);
}

function copyObject(obj) {
    return _.cloneDeep(obj);
}

function modulo(n, m) {
    return ((n % m) + m) % m;
}

function localDateFromValues({
    year = DateTime.local().year,
    month = DateTime.local().month, // starts at 1
    day = DateTime.local().day, // starts at 1
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
    weekday = null, // starts at 1
} = {}) {
    if (weekday !== null) {
        let dt = DateTime.local(year, month, day);
        return dt.set({weekday: weekday, hour: hour, minute: minute, second: second, millisecond: millisecond});
    }
    else {
        return DateTime.local(year, month, day, hour, minute, second, millisecond);
    }
}

function localDate(utc) {
    return DateTime.fromMillis(utc).setZone(DateTime.local().zoneName);
}

function localWeekTime(weekMillis) {
    return {
        totalMilliseconds: modulo(weekMillis + (DateTime.local().offset * 60000), 604800000),
        weekday: function() {
            if (this.totalMilliseconds === 0) {
                return 1;
            }
            else {
                return Math.floor(this.totalMilliseconds / 86400000) + 1;
            }
        },
        hour: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 3600000), 24);
            }
        },
        minute: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 60000), 60);
            }
        },
        second: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(Math.floor(this.totalMilliseconds / 1000), 60);
            }
        },
        millisecond: function() {
            if (this.totalMilliseconds === 0) {
                return 0;
            }
            else {
                return modulo(this.totalMilliseconds, 1000);
            }
        },
        toLocaleString: function(format=null) {
            if (format === null) {
                return DateTime.local().set({weekday: this.weekday(), hour: this.hour(), minute: this.minute(), second: this.second(), millisecond: this.millisecond()}).toLocaleString();
            }
            else {
                return DateTime.local().set({weekday: this.weekday(), hour: this.hour(), minute: this.minute(), second: this.second(), millisecond: this.millisecond()}).toLocaleString(format);
            }
        }
    };
}

function executeQuery(query=null, afterQuery=null) {
    function executeAfterQueries() {
        if (afterQuery !== null) {
            if (Array.isArray(afterQuery)) {
                for (let i = 0; i < afterQuery.length; i++) {
                    if ("onResponse" in afterQuery[i]) {
                        sendRequest(afterQuery[i].path, afterQuery[i].data || {}, afterQuery[i].onResponse);
                    }
                    else {
                        sendRequest(afterQuery[i].path, afterQuery[i].data || {});
                    }
                }
            }
            else {
                if ("onResponse" in afterQuery) {
                    sendRequest(afterQuery.path, afterQuery.data || {}, afterQuery.onResponse);
                }
                else {
                    sendRequest(afterQuery.path, afterQuery.data || {});
                }
            }
        }
    }
    function executeQueries() {
        if (Array.isArray(query)) {
            for (let i = 0; i < query.length; i++) {
                if (i === query.length - 1) {
                    sendRequest(query[i].path, query[i].data || {}, (res) => {
                        if ("onResponse" in query) {
                            query[i].onResponse(res);
                        }
                        executeAfterQueries();
                    });
                }
                else {
                    if ("onResponse" in query[i]) {
                        sendRequest(query[i].path, query[i].data || {}, query[i].onResponse);
                    }
                    else {
                        sendRequest(query[i].path, query[i].data || {});
                    }
                }
            }
        }
        else {
            sendRequest(query.path, query.data || {}, (res) => {
                if ("onResponse" in query) {
                    query.onResponse(res);
                }
                executeAfterQueries();
            });
        }
    }
    return function() {
        if (query !== null) {
            executeQueries();
        }
        else {
            executeAfterQueries();
        }
    };
}

// onResponse takes a response argument.
function sendRequest(path, data, onResponse=function(res) {if (res.data !== 0) window.alert(res.data)}) {
    axios.post(path, data, {baseURL: config.url, withCredentials: false}).then(res => res.data === -1 ? window.location.reload() : onResponse(res));
}

function variantFromCategory(category, defaultVariant="") {
    let variant = variants[category];
    if (variant === undefined) {
        return defaultVariant;
    }
    else {
        return variant;
    }
}

const categoryMap = {
    primary: 0,
    secondary: 1,
    success: 2,
    warning: 3,
    danger: 4,
    info: 5,
    dark: 6
}

const variants = ["primary", "secondary", "success", "warning", "danger", "info", "dark"];

// Assumes range2.start <= range2.end
function insideRange(range1, range2, startKey="start", endKey="end") {
    return range1[startKey] >= range2[startKey] && range1[endKey] <= range2[endKey];
}

function rangesOverlap(range1, range2, startKey="start", endKey="end") {
    return (range1[startKey] >= range2[startKey] && range1[startKey] <= range2[endKey]) || (range1[endKey] <= range2[endKey] && range1[endKey] >= range2[startKey]);
}

// Assumes list is sorted
function overlapSearch(item, list, startKey="start", endKey="end") {
    for (let i = 0; i < list.length; i++) {
        if (rangesOverlap(item, list[i], startKey, endKey)) {
            return true;
        }
    }
    return false;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function rruleDateToDateTime(dateString, timezone=null) {
    let dt = DateTime.local();
    if (timezone) dt.setZone(timezone);
    dt = dt.set({
        year: parseInt(dateString.slice(0, 4)), 
        month: parseInt(dateString.slice(4, 6)), 
        day: parseInt(dateString.slice(6, 8)), 
        hour: parseInt(dateString.slice(9, 11)), 
        minute: parseInt(dateString.slice(11, 13)), 
        second: parseInt(dateString.slice(13, 15))
    });
    return dt;
}

/* Function behavior is undefined if start and until timezones are not the same.
Whatever parameters you put in will go into the string even if it's no longer a valid rrule.
Notes: bySetPos can be -1, in this case it matches the last of that day for that month. */
function rruleString(rruleObject=null) {
    const {
        start=DateTime.local(), 
        frequency="DAILY", 
        interval=1, 
        count=null, 
        until=null, 
        byDay=null, 
        byMonthDay=null, 
        bySetPos=null, 
        byMonth=null
    } = rruleObject;

    let rrule = `DTSTART;TZID=${start.zoneName}:${pad(start.year, 4)}${pad(start.month, 2)}${pad(start.day, 2)}T${pad(start.hour, 2)}${pad(start.minute, 2)}${pad(start.second, 2)}\nRRULE:FREQ=${frequency.toUpperCase()};INTERVAL=${interval}`;
    if (count) rrule += `;COUNT=${count}`;
    else if (until) rrule += `;UNTIL=${pad(until.year, 4)}${pad(until.month, 2)}${pad(until.day, 2)}T${pad(until.hour, 2)}${pad(until.minute, 2)}${pad(until.second, 2)}`;
    switch (frequency) {
        case "WEEKLY":
            if (byDay && byDay.length > 0) rrule += `;BYDAY=${Array.isArray(byDay) ? byDay.join().toUpperCase() : byDay}`;
            else rrule += ";BYDAY=MO";
            break;
        case "MONTHLY":
            if (byMonthDay) rrule += `;BYMONTHDAY=${byMonthDay}`;
            else if (bySetPos && byDay && byDay.length > 0) {
                rrule += `;BYSETPOS=${bySetPos}`;
                rrule += `;BYDAY=${Array.isArray(byDay) ? byDay.join().toUpperCase() : byDay}`;
            }
            else rrule += ";BYMONTHDAY=1";
            break;
        case "YEARLY":
            if (byMonth && byMonthDay) {
                rrule += `;BYMONTH=${byMonth}`;
                rrule += `;BYMONTHDAY=${byMonthDay}`;
            }
            else if (byMonth && bySetPos && byDay && byDay.length > 0) {
                rrule += `;BYMONTH=${byMonth}`;
                rrule += `;BYSETPOS=${bySetPos}`;
                rrule += `;BYDAY=${Array.isArray(byDay) ? byDay.join().toUpperCase() : byDay}`;
            }
            else rrule += ";BYMONTH=1;BYMONTHDAY=1";
            break;
        default:
            break;
    }
    
    // if (byDay) rrule += `;BYDAY=${Array.isArray(byDay) ? byDay.join().toUpperCase() : byDay}`;
    // if (byMonthDay) rrule += `;BYMONTHDAY=${byMonthDay}`;
    // if (bySetPos) rrule += `;BYSETPOS=${bySetPos}`;
    // if (byMonth) rrule += `;BYMONTH=${byMonth}`;

    return rrule;
}

function rruleObject(rruleString=null) {
    let rrule = {start: DateTime.local(), frequency: "DAILY", interval: 1, count: null, until: null, byDay: null, byMonthDay: null, bySetPos: null, byMonth: null};
    if (rruleString === null) return rrule;

    let [upper, lower] = rruleString.split('\n');
    upper = upper.split('=')[1].split(':');
    lower = lower.split(':')[1].split(';');

    rrule.start = rruleDateToDateTime(upper[1], upper[0]);

    for (let i = 0; i < lower.length; i++) {
        const [left, right] = lower[i].split('=');
        switch (left) {
            case "FREQ":
                rrule.frequency = right;
                break;
            case "INTERVAL":
                rrule.interval = parseInt(right);
                break;
            case "COUNT":
                rrule.count = parseInt(right);
                break;
            case "UNTIL":
                rrule.until = rruleDateToDateTime(right);
                break;
            case "BYDAY":
                rrule.byDay = right.split(',');
                break;
            case "BYMONTHDAY":
                rrule.byMonthDay = parseInt(right);
                break;
            case "BYSETPOS":
                rrule.bySetPos = parseInt(right);
                break;
            case "BYMONTH":
                rrule.byMonth = parseInt(right);
                break;
            default:
                break;
        }
    }

    return rrule;
}

export {
    eventFire,
    executeQuery,
    sendRequest,
    categoryMap,
    variants,
    variantFromCategory,
    localDate,
    localDateFromValues,
    localWeekTime,
    modulo,
    copyObject,
    insideRange,
    rangesOverlap,
    overlapSearch,
    pad,
    rruleString,
    rruleObject,
    invert,
    pathLowestLevel,
    randomColor,
}