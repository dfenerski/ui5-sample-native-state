interface TaskItem {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'inProgress' | 'done';
    priority: 'low' | 'medium' | 'high';
}

export class Task {
    public items: TaskItem[];
    public selectedTask: TaskItem | null;

    constructor(data: Partial<Task>) {
        this.items = data.items || [];
        this.selectedTask = data.selectedTask || null;
    }
}
