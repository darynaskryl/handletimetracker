import { taskSelected, taskWrapping, taskCompleted, holdCall, unholdCall } from '../actions/handleTimeTrackerActions';
import writeFBR from '../helpers/firtsBrandResponse';

export const logHandleTime = (payload, store) => {
  console.log('Running logHandleTime function');
  console.log(payload);

  //No task is selected
  if (typeof payload.sid === 'undefined') {
    return
  }

  const currentTaskSid = payload.sid;
  const state = store.getState();
  const previousTaskSid = state.flex.view.selectedTaskSid;

  console.log('previousTaskSid', previousTaskSid);

  //Only execute if a new task is selected, do nothing if the same task is selected again
  if (previousTaskSid !== currentTaskSid) {
    let previousTaskSelectedTime = '';
    let previousTaskHandleTime = '';
    if (Object.keys(state.handleTimeTracker.reservations).length > 0) {
      previousTaskSelectedTime = previousTaskSid in state.handleTimeTracker.reservations ? state.handleTimeTracker.reservations[previousTaskSid].selectedTime : 0;
      previousTaskHandleTime = previousTaskSid in state.handleTimeTracker.reservations ? state.handleTimeTracker.reservations[previousTaskSid].handleTime : 0;
      console.log('previous task selected time', previousTaskSelectedTime);
      console.log('previous task handle time', previousTaskHandleTime);
    }

    const currentTaskPreviousHandleTime = currentTaskSid in state.handleTimeTracker.reservations ? state.handleTimeTracker.reservations[currentTaskSid].handleTime : 0;
    console.log('current task previous handle time', currentTaskPreviousHandleTime);
    //Added to check for long wrapup time
    console.log("PayloadLH--", payload, payload.task)
    if (payload && payload.task) {
      let attributes = payload.task.attributes;
      if (attributes) {
        attributes.logHandleTime = { previousTaskSelectedTime, previousTaskHandleTime, currentTaskPreviousHandleTime, previousTaskSid, currentTaskSid };
        payload.task.setAttributes(attributes);
      }
    }
    store.dispatch(taskSelected(currentTaskSid, currentTaskPreviousHandleTime, previousTaskSid, previousTaskSelectedTime, previousTaskHandleTime));
  }
}

export const logHoldTime = (payload, store) => {
  const taskSid = payload.reservationSid ? payload.reservationSid : payload.sid;
  const holdTimestamp = new Date();

  store.dispatch(holdCall(taskSid, holdTimestamp));
}

export const calculateHoldTime = (payload, store) => {
  const taskSid = payload.reservationSid ? payload.reservationSid : payload.sid;
  const state = store.getState();
  const currentDate = new Date();
  const holdTimestamp = new Date(state.handleTimeTracker.reservations[taskSid].holdTimestamp);
  const timeDifference = currentDate.getTime() - holdTimestamp.getTime();
  const seconds = Math.abs(timeDifference / 1000);
  const holdTime = (state.handleTimeTracker.reservations[taskSid].holdTime || 0) + seconds;
  console.log("hold time ", holdTime);
  //Added to check for long wrapup time
  console.log("PayloadCHO--", payload, payload.task)
  if (payload && payload.task) {
    let attributes = payload.task.attributes;
    if (attributes) {
      attributes.calculateHoldTime = { holdTime, seconds, timeDifference };
      payload.task.setAttributes(attributes);
    }
  }
  store.dispatch(unholdCall(taskSid, holdTime));
}

export const calculateHandlTime = (payload, store) => {
  console.log('Running Finish Task function');
  console.log(payload);
  const taskSid = payload.reservationSid ? payload.reservationSid : payload.sid;
  const state = store.getState();
  console.log(state.handleTimeTracker);

  const currentDate = new Date();
  const previousTaskSelectedTime = new Date(state.handleTimeTracker.reservations[taskSid].selectedTime);
  console.log("previousTaskSelectedTime ", previousTaskSelectedTime);
  const timeDifference = currentDate.getTime() - previousTaskSelectedTime.getTime();
  const seconds = Math.abs(timeDifference / 1000);
  console.log("sedonds ", seconds);
  const handleTime = state.handleTimeTracker.reservations[taskSid].handleTime + seconds;
  console.log("handle time ", handleTime);
  //Added to check for long wrapup time
  console.log("PayloadCHN--", payload, payload.task)
  if (payload && payload.attributes) {
    let attributes = payload.attributes;
    if (typeof(attributes.conversations) !== 'undefined') {
      if (typeof(attributes.conversations.conversation_measure_1) !== 'undefined') {
        attributes.conversations.conversation_measure_1 = attributes.conversations.conversation_measure_1 + handleTime;
      } else {
        attributes.conversations.conversation_measure_1 = handleTime;
      }
    } else {
      attributes.conversations = {
        conversation_measure_1: handleTime
      }
    }
    if (attributes) {
      attributes.calculateHandlTime = { handleTime, seconds, timeDifference, taskSid };
      payload.setAttributes(attributes);
    }
  }
  store.dispatch(taskWrapping(taskSid, handleTime));
}

export const writeHandleTime = async (payload, store) => {
  console.log(payload);

  if (payload.task.taskChannelUniqueName === 'sfdc-task' || payload.task.taskChannelUniqueName === 'email' || payload.task.taskChannelUniqueName === 'web') {
    calculateHandlTime(payload, store);
  }

  const taskSid = payload.task.sid;
  console.log(taskSid);
  const state = store.getState();
  console.log(state);
  const handleTime = state.handleTimeTracker.reservations[taskSid].handleTime || 0;
  const holdTime = state.handleTimeTracker.reservations[taskSid].holdTime || 0;
  const talkTime = handleTime - holdTime;
  console.log('handleTime', handleTime);
  console.log('holdTime', holdTime);
  console.log('talkTime', talkTime);

  let attributes = payload.task.attributes;
  console.log(attributes);

  //add calculating fbr function
  const age = writeFBR(payload, store);
  console.log("fbr", age)

  //add case number in task attributes
  //const selectedCaseNames = [];
  //window.selectedCases.map(item => {
    //  return selectedCaseNames.push(item.displayName);
  //});
  //add existing handle time in case of a transfer
  if (typeof(attributes.conversations) !== 'undefined') {
    // if (typeof(attributes.conversations.conversation_measure_1) !== 'undefined') {
    //   attributes.conversations.conversation_measure_1 = attributes.conversations.conversation_measure_1 + handleTime;
    // } else {
    //   attributes.conversations.conversation_measure_1 = handleTime;
    // }
    if (typeof(attributes.conversations.hold_time) !== 'undefined') {
      attributes.conversations.hold_time = attributes.conversations.hold_time + holdTime;
    } else {
      attributes.conversations.hold_time = holdTime;
    }
      attributes.conversations.conversation_measure_5 = age;
      //attributes.conversations.case = selectedCaseNames.toString();
  } else {
    attributes.conversations = {
      conversation_measure_1: handleTime,
      hold_time: holdTime,
      conversation_measure_5: age
      //case : selectedCaseNames.toString()
    }
  }
  attributes.writeHandleTime ={
    handleTime, holdTime, age, taskSid
  }
  const updatedAttributes = await payload.task.setAttributes(attributes);
  console.log("updatedattr",updatedAttributes);
  store.dispatch(taskCompleted(taskSid));
}
