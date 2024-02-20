import { StateService } from '../State.service';
import { Task, TaskItem } from './Task';

class TaskStateService extends StateService<Task> {
    public setTaskTitle(id: TaskItem['id'], title: TaskItem['title']) {
        const taskIndex = this.state.items.findIndex((task) => task.id === id);
        this._model.setProperty(`/items/${taskIndex}/title`, title);
    }

    public setTaskDescription(
        id: TaskItem['id'],
        description: TaskItem['description'],
    ) {
        const taskIndex = this.state.items.findIndex((task) => task.id === id);
        this._model.setProperty(`/items/${taskIndex}/description`, description);
    }

    public setTaskStatus(id: TaskItem['id'], status: TaskItem['status']) {
        const taskIndex = this.state.items.findIndex((task) => task.id === id);
        this._model.setProperty(`/items/${taskIndex}/status`, status);
    }

    public setTaskPriority(id: TaskItem['id'], priority: TaskItem['priority']) {
        const taskIndex = this.state.items.findIndex((task) => task.id === id);
        this._data.items[taskIndex].priority = priority;
        this._model.updateBindings(true);
    }

    public setSelectedTask(task: TaskItem | null) {
        this._model.setProperty('/selectedTask', task);
    }

    public addTask(task: TaskItem) {
        this._data.items.push(task);
        this._model.updateBindings(true);
    }

    public removeTask(id: TaskItem['id']) {
        const taskIndex = this.state.items.findIndex((task) => task.id === id);
        this._data.items.splice(taskIndex, 1);
        this._model.updateBindings(true);
    }
}

const taskModel = new TaskStateService(
    'task',
    new Task({
        items: [
            {
                id: '1',
                title: 'Task 1',
                description: 'Description 1',
                priority: 1,
                status: 'open',
            },
            {
                id: '2',
                title: 'Task 2',
                description: 'Description 2',
                priority: 2,
                status: 'inProgress',
            },
            {
                id: '3',
                title: 'Task 3',
                description: 'Description 3',
                priority: 3,
                status: 'open',
            },
        ],
        selectedTask: null,
    }),
);

export { taskModel as TaskStateService };
