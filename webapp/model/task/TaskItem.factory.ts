import { TaskItem } from './Task';

export class TaskItemFactory {
    public static createEmptyTaskItem(): TaskItem {
        return {
            id: '',
            title: '',
            description: '',
            status: 'open',
            priority: 1,
        } satisfies TaskItem;
    }
}
