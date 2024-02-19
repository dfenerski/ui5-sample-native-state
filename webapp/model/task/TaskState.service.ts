import Component from 'sap/ui/core/Component';
import JSONModel from 'sap/ui/model/json/JSONModel';
import { DeepPartial } from '../../types/DeepPartial';
import { DeepReadonly } from '../../types/DeepReadonly';
import { Task } from './Task';

class TaskStateService {
    private readonly _model: JSONModel;

    constructor(modelName: string, task: Task) {
        this._model = new JSONModel(task);
        this.register(modelName);
    }

    public get state(): DeepReadonly<Task> {
        return <DeepReadonly<Task>>this._model.getData();
    }

    private register(modelName: string) {
        Component.getComponentById(
            'com.github.dfenerski.native_state.Component',
        ).setModel(this._model, modelName);
    }

    private set(taskLike: DeepPartial<Task>): void {
        this._model.setData(taskLike, true);
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
                priority: 'low',
                status: 'open',
            },
            {
                id: '2',
                title: 'Task 2',
                description: 'Description 2',
                priority: 'medium',
                status: 'inProgress',
            },
            {
                id: '3',
                title: 'Task 3',
                description: 'Description 3',
                priority: 'high',
                status: 'open',
            },
        ],
        selectedTask: null,
    }),
);

export { taskModel as TaskStateService };
