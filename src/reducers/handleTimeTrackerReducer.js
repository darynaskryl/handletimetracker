import { omit } from 'lodash';

const handleTimeTrackerReducer = (state = {reservations: {}}, action) => {
  switch (action.type) {

    case 'TASK_SELECTED':
      const currentDate = new Date();
      console.log(action);

      if (action.previousTaskSid === undefined) {
        return Object.assign({}, state, {
          reservations: {
            ...state.reservations,
            [action.currentTaskSid]: {
              ...state.reservations[action.currentTaskSid],
              selectedTime: currentDate,
              active: true,
              handleTime: 0
            }
          }
        });
      } else {
        const previousTaskSelectedTime = new Date(action.previousTaskSelectedTime);
        const timeDifference = currentDate.getTime() - previousTaskSelectedTime.getTime();
        const seconds = Math.abs(timeDifference / 1000);
        console.log('seconds', seconds);
        console.log('previous task previous handle time', action.previousTaskHandleTime);
        const handleTime = action.previousTaskHandleTime + seconds;

        console.log('new task sid', action.currentTaskSid);
        console.log('previousTaskSid', action.previousTaskSid);
        console.log('current task previous handle time', action.currentTaskPreviousHandleTime);
        console.log('previous task handle time', handleTime);

        return Object.assign({}, state, {
          reservations: {
            ...state.reservations,
            [action.currentTaskSid]: {
              ...state.reservations[action.currentTaskSid],
              selectedTime: currentDate,
              active: true,
              handleTime: action.currentTaskPreviousHandleTime
            },
            [action.previousTaskSid]: {
              ...state.reservations[action.previousTaskSid],
              active: false,
              handleTime: handleTime
            }
          }
        });
      }

    case 'TASK_WRAPPING':
      return Object.assign({}, state, {
        reservations: {
          ...state.reservations,
          [action.taskSid]: {
            ...state.reservations[action.taskSid],
            active: false,
            handleTime: action.handleTime
          }
        }
      })

    case 'HOLD_CALL':
      return Object.assign({}, state, {
        reservations: {
          ...state.reservations,
          [action.taskSid]: {
            ...state.reservations[action.taskSid],
            holdTimestamp: action.holdTimestamp,
          }
        }
      });

    case 'UNHOLD_CALL':
      return Object.assign({}, state, {
        reservations: {
          ...state.reservations,
          [action.taskSid]: {
            ...state.reservations[action.taskSid],
            holdTime: action.holdTime,
          }
        }
      });

    case 'TASK_COMPLETED':
      //return Object.assign({}, state, omit(...state, action.taskSid));

      console.log('removing task from redux');
      console.log(action.taskSid);

      return Object.assign({}, state, {
        reservations: omit(state.reservations, action.taskSid)
      })

    /* falls through */
    default:
      return state
  }
}

export default handleTimeTrackerReducer
