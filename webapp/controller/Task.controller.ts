import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import { LayoutType } from 'sap/f/library';
import { AppStateService } from '../model/app/AppState.service';
import { TaskStateService } from '../model/task/TaskState.service';
import BaseController from './BaseController';

/**
 * @namespace com.github.dfenerski.native_state.controller
 */
export default class Task extends BaseController {
    private readonly taskModel = TaskStateService;
    private readonly appModel = AppStateService;

    private resourceBundle: ResourceBundle;

    public async onInit(): Promise<void> {
        this.resourceBundle = await this.getResourceBundle();
    }

    public handleCloseRequest(): void {
        this.appModel.setLayout(LayoutType.OneColumn);
    }

    public handleSaveRequest(): void {
        const selectedTask = this.taskModel.state.selectedTask;
        if (selectedTask.id) {
            this.taskModel.setTaskTitle(selectedTask.id, selectedTask.title);
            this.taskModel.setTaskDescription(
                selectedTask.id,
                selectedTask.description,
            );
            this.taskModel.setTaskStatus(selectedTask.id, selectedTask.status);
            this.taskModel.setTaskPriority(
                selectedTask.id,
                selectedTask.priority,
            );
        } else {
            this.taskModel.addTask(structuredClone(selectedTask));
        }
        this.appModel.setLayout(LayoutType.OneColumn);
    }
}
