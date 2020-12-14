export const taskSelected = (currentTaskSid, currentTaskPreviousHandleTime, previousTaskSid, previousTaskSelectedTime, previousTaskHandleTime) => ({
  type: 'TASK_SELECTED',
  currentTaskSid,
  currentTaskPreviousHandleTime,
  previousTaskSid,
  previousTaskSelectedTime,
  previousTaskHandleTime
})

export const taskWrapping = (taskSid, handleTime) => ({
  type: 'TASK_WRAPPING',
  taskSid,
  handleTime
})

export const taskCompleted = (taskSid) => ({
  type: 'TASK_COMPLETED',
  taskSid
})

export const holdCall = (taskSid, holdTimestamp) => ({
  type: 'HOLD_CALL',
  taskSid,
  holdTimestamp,
});

export const unholdCall = (taskSid, holdTime) => ({
  type: 'UNHOLD_CALL',
  taskSid,
  holdTime,
});
