import { StateService } from '../State.service';
import { Task } from './Task';

class TaskStateService extends StateService<Task> {}

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
