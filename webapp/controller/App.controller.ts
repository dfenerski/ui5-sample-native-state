import { TaskStateService } from '../model/task/TaskState.service';
import BaseController from './BaseController';

/**
 * @namespace com.github.dfenerski.native_state.controller
 */
export default class App extends BaseController {
    private readonly taskModel = TaskStateService;

    public onInit(): void {
        // Apply content density mode to root view
        this.getView().addStyleClass(
            this.getOwnerComponent().getContentDensityClass(),
        );
    }
}
