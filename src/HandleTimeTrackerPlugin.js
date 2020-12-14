import { FlexPlugin } from 'flex-plugin';
import { logHandleTime, calculateHandlTime, writeHandleTime, logHoldTime, calculateHoldTime } from './helpers/logHandleTime';
import handleTimeTrackerReducer from './reducers/handleTimeTrackerReducer';
import writeFBR from './helpers/firtsBrandResponse';

const PLUGIN_NAME = 'HandleTimeTrackerPlugin';

export default class HandleTimeTrackerPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    //Add Listener for SelectTask
    flex.Actions.addListener("beforeSelectTask", payload =>
      logHandleTime(payload, manager.store)
    );

    //Add Listener for Competed Task
    flex.Actions.addListener("afterAcceptTask", payload => {
      console.log("Adding After Task Accept listener");
      payload.task._task.on("wrapup", payload => {
        calculateHandlTime(payload, manager.store);
      }
      );
    });

    //Write the handle time to the task as an attribute
    flex.Actions.addListener("beforeCompleteTask", payload => {
      const { store } = manager
      writeHandleTime(payload, store)
    })

    flex.Actions.addListener('beforeHoldCall', (payload) => logHoldTime(payload, manager.store));

    flex.Actions.addListener('beforeUnholdCall', (payload) => calculateHoldTime(payload, manager.store));

    //Add custom redux store
    manager.store.addReducer("handleTimeTracker", handleTimeTrackerReducer);
  }
}