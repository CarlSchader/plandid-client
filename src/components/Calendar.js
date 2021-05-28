import React, { useState, useRef, useEffect } from 'react';

import { DateTime, Interval } from "luxon";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import luxonPlugin from '@fullcalendar/luxon';

import {rruleString, rruleObject, localDate, executeQuery} from "../utilities";
import {millisecondMap} from "../constants";
import config from '../config.json';
import EventPopover from './EventPopover';

const minSelectMinutes = 10;
const selectMinutesModulus = 5;
let newEvents = [];
let mirrorElements = [];

function Calendar({tier=""}) {
    const calendarRef = useRef(null);
    const [query, setQuery] = useState({
        path: "/events/getEvents",
        onResponse: res => {
            newEvents = res.data;
            refreshCalendar();
        }
    });
    const [state, setState] = useState(1);
    const [selectedDate, setSelectedDate] = useState(DateTime.local());
    const {0: plans} = useState([]);
    const [eventPopoverOpen, setEventPopoverOpen] = useState(false);
    const [currentInfo, setCurrentInfo] = useState(null);

    useEffect(executeQuery(query), []);

    const states = {
        0: {
            view: "dayGridMonth",
            isEditable: true, // NEW was false
            headerToolbar: {start: "", center: "title", end: "currentMonth prev,next"},
            selectable: true,
            dateClick: dateClickStandard,
            select: () => {},
            slotDuration: "01:00:00",
            snapDuration: "00:30:00",
            contentHeight: null,
            height: window.innerHeight,
            firstDate: 0,
        },
        1: {
            view: "timeGridWeek",
            isEditable: true,
            headerToolbar: {start: "monthButton", center: "title", end: "currentWeek prev,next"},
            selectable: true,
            dateClick: info => {},
            select: async function(info) {
                const start = DateTime.fromISO(info.startStr).toMillis();
                let distance = Math.max(DateTime.fromISO(info.endStr).toMillis() - start, minSelectMinutes * millisecondMap.minute);
                distance = distance - (distance % (selectMinutesModulus * millisecondMap.minute));
                let newEvent = {
                    start: start,
                    end: start + distance,
                    name: "New Task",
                    category: null,
                    // timezone: DateTime.local().zoneName,
                    rrule: null
                };
                addNewEvent(newEvent);
            },
            slotDuration: "00:15:00",
            snapDuration: `00:05:00`,
            contentHeight: 'auto',
            height: 'auto',
            firstDate: 0,
        },
        2: {
            view: "timeGridDay",
            isEditable: true,
            headerToolbar: {start: "weekButton", center: "title", end: "currentDay prev,next"},
            selectable: true,
            dateClick: info => {},
            select: async function(info) {
                let dt = DateTime.fromISO(info.dateStr);
                let newEvent = {
                    start: dt.toMillis(),
                    end: dt.plus({hours: 1}).toMillis(),
                    name: "New Task",
                    category: null,
                    // timezone: DateTime.local().zoneName,
                    rrule: null
                };
                addNewEvent(newEvent);
            },
            slotDuration: "00:15:00",
            snapDuration: `00:05:00`,
            contentHeight: 'auto',
            height: 'auto',
            firstDate: 0,
        }
    };

    function refreshCalendar() {
        clearCalendarEvents();
        for(let i = 0; i < newEvents.length; i++) {
            addEventToCalendar(newEvents[i], `n${i}`);
        }
    }

    function addNewEvent(newEvent) {
        newEvents.push(newEvent);
        refreshCalendar();
        executeQuery({
            path: "events/addEvent",
            data: {event: newEvent}
        })();
    }

    function updateNewEvent(index, updatedEvent) {
        newEvents[index] = updatedEvent;
        refreshCalendar();
        executeQuery({
            path: "events/updateEvent",
            data: {index: index, event: updatedEvent}
        })();
    }

    function deleteNewEvent(index) {
        newEvents.splice(index, 1);
        refreshCalendar();
        executeQuery({
            path: "events/deleteEvent",
            data: {index: index}
        })();
    }

    function addEventToCalendar(newEvent, id) {
        console.log(newEvents);
        let api = calendarRef.current.getApi();
        const idLetter = id[0];
        switch (idLetter) {
            case 'n':
                if (newEvent.rrule) {
                    api.addEvent({
                        backgroundColor: `${config.colors.primary.main}bf`,
                        borderColor: `${config.colors.primary.main}bf`,
                        textColor: `${config.colors.primary.contrastText}bf`,
                        groupId: id,
                        title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                        dtstart: localDate(newEvent.start).toISO(),
                        duration: {milliseconds: Interval.fromDateTimes(localDate(newEvent.start), localDate(newEvent.end)).length("milliseconds")},
                        rrule: newEvent.rrule,
                        extendedProps: newEvent
                    });
                }
                else {
                    api.addEvent({
                        backgroundColor: `${config.colors.primary.main}bf`,
                        borderColor: `${config.colors.primary.main}bf`,
                        textColor: `${config.colors.primary.contrastText}bf`,
                        id: id,
                        title: newEvent.name + (newEvent.category ? ": " + newEvent.category : ""),
                        start: localDate(newEvent.start).toISO(),
                        end: localDate(newEvent.end).toISO(),
                        extendedProps: newEvent
                    });
                }
                break;
            case 'p':
                api.addEvent({
                    backgroundColor: config.colors.primary.main,
                    borderColor: config.colors.primary.main,
                    textColor: config.colors.primary.contrastText,
                    id: id,
                    title: "[" + newEvent.personName + "] " + newEvent.eventName + (newEvent.category ? ": " + newEvent.category : ""),
                    start: localDate(newEvent.start).toISO(),
                    end: localDate(newEvent.end).toISO(),
                    extendedProps: newEvent
                });
                break;
        }
    }

    function clearCalendarEvents() {
        let events = calendarRef.current.getApi().getEvents();
        for (let i = 0; i < events.length; i++) {
            events[i].remove();
        }
    }

    function changeState(newState, nextDate) {
        if (newState in states) {
            setState(newState);
            let calendarApi = calendarRef.current.getApi();
            calendarApi.changeView(states[newState].view, nextDate.toMillis());
        }
    }

    function dateClickStandard(info) {
        let dt = DateTime.fromISO(info.dateStr);
        if (info.date) {
            setSelectedDate(dt);
            changeState(state + 1, dt);
        }
    }

    function onCalendarEventChange(info) {
        const event = info.event;
        let idLetter = '';
        let id = -1;
        const difference = DateTime.fromISO(event.startStr).toMillis() - localDate(event.extendedProps.start).toMillis();
        let rrule = event.extendedProps.rrule;
        if (event.groupId) {
            let rruleObj = rruleObject(rrule);
            idLetter = event.groupId[0];
            id = parseInt(event.groupId.substring(1));
            rruleObj.start = rruleObj.start.plus(difference);
            if (rruleObj.until) rruleObj.until = rruleObj.until.plus(difference);
            rrule = rruleString(rruleObj);
        }
        else {
            idLetter = event.id[0];
            id = parseInt(event.id.substring(1));
        }

        switch (idLetter) {
            case 'n':
                let newEvent = {
                    start: DateTime.fromISO(event.startStr).toMillis(),
                    end: DateTime.fromISO(event.endStr).toMillis(),
                    name: event.title,
                    category: event.extendedProps.category,
                    // timezone: event.extendedProps.zoneName,
                    rrule: rrule
                };
                if (newEvent.rrule) {
                    updateNewEvent(id, newEvent);
                }
                else {
                    newEvents[id] = newEvent;
                    executeQuery({
                        path: "events/updateEvent",
                        data: {index: id, event: newEvent}
                    })();
                }
                break;
            default:
                break;
        }
    }

    function handleMirror(info) {
        info.el.style.backgroundColor = config.colors.primary.main;
        info.el.style.borderColor = config.colors.primary.main;
        info.el.style.textColor = config.colors.primary.contrastText;
        mirrorElements.push(info.el);

        info.el.addEventListener("mouseup", () => {
            for (let i = 0; i < mirrorElements.length; i++) {
                mirrorElements[i].remove();
            }
        });
    }

    function dialogJsx() {
        if (currentInfo) {
            return <EventPopover
            open={eventPopoverOpen}
            setOpen={setEventPopoverOpen}
            info={currentInfo} 
            eventsArray={newEvents}
            addNewEvent={addNewEvent}
            deleteNewEvent={deleteNewEvent}
            updateNewEvent={updateNewEvent}
            calendarRef={calendarRef}
            />;
        }
        else {
            return <div></div>
        }
    }

    return (
        <div>
            <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin]}
            timeZone={DateTime.local().zoneName}
            initialView={states[state].view}
            // events={getCalendarEvents()}
            initialDate={selectedDate.toISO()}
            firstDay={states[state].firstDay}
            eventResizableFromStart={true}
            // selectMirror={true}
            longPressDelay={333}
            // expandRows={true}
            editable={states[state].isEditable}
            headerToolbar={states[state].headerToolbar}
            selectable={states[state].selectable}
            dateClick={states[state].dateClick}
            select={states[state].select}
            slotDuration={states[state].slotDuration}
            snapDuration={states[state].snapDuration}
            contentHeight={states[state].contentHeight}
            height={states[state].height}

            eventDidMount={info => {
                if (info.isMirror) {
                    handleMirror(info);
            }}}
            eventDrop={onCalendarEventChange}
            eventResize={onCalendarEventChange}

            eventClick={info => {setCurrentInfo(info); setEventPopoverOpen(true)}}

            customButtons={{
                monthButton: {
                    text: "Month",
                    click: () => {changeState(0, selectedDate)}
                },
                weekButton: {
                    text: "Week",
                    click: () => {changeState(1, selectedDate)}
                },
                currentMonth: {
                    text: "Current Month",
                    click: () => {setSelectedDate(DateTime.local()); changeState(0, DateTime.local());}
                },
                currentWeek: {
                    text: "Current Week",
                    click: () => {setSelectedDate(DateTime.local()); changeState(1, DateTime.local());}
                },
                currentDay: {
                    text: "Today",
                    click: () => {setSelectedDate(DateTime.local()); changeState(2, DateTime.local());}
                },
                applyButton: {
                    text: "Apply Changes",
                    click: _ => {}
                }
            }}
            />
            {dialogJsx()}
        </div>
    );
}

export default Calendar;
