import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import { LayoutType } from 'sap/f/library';
import { Button$PressEvent } from 'sap/m/Button';
import { IconColor } from 'sap/ui/core/library';
import { AppStateService } from '../model/app/AppState.service';
import { TaskItem } from '../model/task/Task';
import { TaskItemFactory } from '../model/task/TaskItem.factory';
import { TaskStateService } from '../model/task/TaskState.service';
import BaseController from './BaseController';

/**
 * @namespace com.github.dfenerski.native_state.controller
 */
export default class Main extends BaseController {
    private readonly taskModel = TaskStateService;
    private readonly appModel = AppStateService;

    private resourceBundle: ResourceBundle;

    public async onInit(): Promise<void> {
        this.resourceBundle = await this.getResourceBundle();
    }

    public getStatusIcon(taskStatus: TaskItem['status']): string {
        if (taskStatus === 'done') {
            return 'sap-icon://accept';
        } else if (taskStatus === 'inProgress') {
            return 'sap-icon://pending';
        } else {
            return 'sap-icon://decline';
        }
    }

    public getStatusColor(taskStatus: TaskItem['status']): IconColor {
        if (taskStatus === 'done') {
            return IconColor.Positive;
        } else if (taskStatus === 'inProgress') {
            return IconColor.Critical;
        } else {
            return IconColor.Negative;
        }
    }

    public getStatusText(taskStatus: TaskItem['status']): string {
        if (taskStatus === 'done') {
            return this.resourceBundle.getText('TASK_STATUS_DONE');
        } else if (taskStatus === 'inProgress') {
            return this.resourceBundle.getText('TASK_STATUS_IN_PROGRESS');
        } else {
            return this.resourceBundle.getText('TASK_STATUS_OPEN');
        }
    }

    public handlePrioChange(event: Button$PressEvent, prioDelta: number) {
        const eventSource = event.getSource();
        const bindingContext = eventSource.getBindingContext('task');
        const taskId = <string>bindingContext.getProperty('id');
        const taskPrio = <number>bindingContext.getProperty('priority');
        // Disallow negative priority
        if (taskPrio + prioDelta < 0) {
            return;
        }
        //
        this.taskModel.setTaskPriority(taskId, taskPrio + prioDelta);
    }

    public handleNewTaskRequest(): void {
        this.taskModel.setSelectedTask(TaskItemFactory.createEmptyTaskItem());
        this.appModel.setLayout(LayoutType.TwoColumnsBeginExpanded);
        this.getRouter().getTargets().display('task');
    }

    public handleEditTaskRequest(event: Button$PressEvent): void {
        const eventSource = event.getSource();
        const bindingContext = eventSource.getBindingContext('task');
        this.taskModel.setSelectedTask(
            <TaskItem>structuredClone(bindingContext.getObject()),
        );
        this.appModel.setLayout(LayoutType.TwoColumnsBeginExpanded);
        this.getRouter().getTargets().display('task');
    }

    public handleRemoveTaskRequest(_: Button$PressEvent, id: string): void {
        this.taskModel.removeTask(id);
    }

    public handleCopyTaskRequest(event: Button$PressEvent): void {
        const eventSource = event.getSource();
        const bindingContext = eventSource.getBindingContext('task');
        this.taskModel.addTask(
            <TaskItem>structuredClone(bindingContext.getObject()),
        );
    }
}
