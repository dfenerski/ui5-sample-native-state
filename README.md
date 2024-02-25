# Introduction

The issue of state management is fundamental to front end web development. However despite its importance, there hasn't been a definitive answer to the "how" question. Should a library be used? Can the pain of magic strings be avoided? The framework pretty much leaves application developers to figure this thing on their own - while abundant, provided tutorials are not often updated. Furthermore requirements and practices often vary per project or organization.

Can the situation be simplified? Probably. The thing is, UI5 had its "TypeScript renaissance" in 2023 with stable support releasing and this was a major game-changer for app development.

The following example application shows a way to manage state natively, without third party libs, while retaining full type safety & avoiding some caveats such as accidental assignment along the way.

##### Disclaimer

Some things are of course out of scope for this demo, including:

-   computed / lazy props (such as in `MobX`)
-   one way data flow (some people hate `byId` & do everything through the model)

While not shown as examples here, the following is rather a "pattern" or "a way to structure state" rather than a sealed solution & can therefore be expanded to fit various needs.

# Getting started

Let's start by considering a trivial example - a ToDo app.

### Defining the model

The first thing to do is probably define what a ToDo `Task` is. What properties are there? How will the app interact with the `Task`s?

```typescript
// model/task/Task.ts
export interface TaskItem {
    id: string;
    title: string;
    description: string;
    status: 'open' | 'inProgress' | 'done';
    priority: number;
}
```

Looks good - we've defined what a task is & typed out its properties. Let's now prepare the model as UI5 will see it. We are going to display the tasks in a list & specifically add the ability to "highlight" or "pick out" a specific task out of the list. However an interface won't do here - these get erased during the compile step to JavaScript.

```typescript
// model/task/Task.ts
export class Task {
    public items: TaskItem[];
    public selectedTask: TaskItem | null;

    constructor(data: Partial<Task>) {
        this.items = data.items || [];
        this.selectedTask = data.selectedTask || null;
    }
}
```

Albeit simple, this model suffices for demo purposes. We can bind our UI5 list to `items` & put "highlighted" tasks into `selectedTask` . The constructor uses the utility type `Partial` which makes it convenient to create instances of this class

### Creating adapter for "writes"

This is the limit of what barebone typization can give us. Anyone exposed to more complex `JSONModel` s knows it only gets worse from here. Why? Well there are 2 options & none of them are very good. You can use `model.setProperty` for granular binding update & endure the pain of writing magic strings any time you want to update a property or you can keep a reference to the data you passed to the `JSONModel` constructor, update the object by reference, and then call `updateBindings` to refresh the bindings cuz the model won't pick them up (`bObservable` only works for existing props).

To address this, solutions using third-party libraries do exist. However to me, it seems like a bit of an overkill to add a npm package for something that UI5 handles natively for the most part.

Let's explore instead another option: we can try to improve the existing solution, so that the biggest pain points are addressed. Incremental improvement can go a long way. Even if we don't completely remove the pain points, if they are contained or managed in a good way, the app will benefit greatly.

##### To the point

1. The issue of the magic strings `.setProperty('/object/prop)` is that they are very easy to get wrong. One wrong letter means you are writing changes to non-existent objects. This gets amplified if it's done inline, at random places, with no cohesion.

2. The issue of working with the reference of the data is twofold. You have to make sure the reference does not break, or the writes will stop working. And for every change, no matter how tiny, you have to `updateBindings`. It's like going after a mosquito with a cannon. It sure can get the job done but is it really needed?

To address 1): we could create a bunch of setters (all setters that the app uses), put them in some place special & only call those methods when we need state change. Furthermore, commonly used strings can be made constants to further decrease the chance of mistyping.

To address 2): We can store the reference some place safe & control the access to the model so it does not break. Furthermore, for smaller updates we can use the typed setters so no major model refreshes are needed.

If we combine the two points above in a single class, it will very much look like an [adapter](https://en.wikipedia.org/wiki/Adapter_pattern). Essentially, we would be defining a contract, an API for ourselves, for propagating state changes to a native `JSONModel`.

```typescript
// model/task/TaskStateService.ts

class TaskStateService {
    // keep a reference to the model we are writing a wrapper for
    private readonly _model: JSONModel;

    // expose unbreakable(it always retrieves up to date reference through `getData`) strongly typed reference to the model data
    protected get _data(): T {
        return <T>this._model.getData();
    }

    // initializing the adapter should initialize the adaptee (the JSONModel)
    constructor(modelName: string, task: Task) {
        this._model = new JSONModel(task);
        this.register(modelName);
    }

    // hook for registering the model
    private register(modelName: string) {
        Component.getComponentById(
            'com.github.dfenerski.native_state.Component',
        ).setModel(this._model, modelName);
    }

    // setter for setting a task status
    // this is the only place in our codebase, where magic strings during model interaction would be allowed.
    // if you are extra rigorous, you can pull reusable string chunks into constants so that they are only ever written once.
    public setTaskStatus(id: TaskItem['id'], status: TaskItem['status']) {
        const taskIndex = this._data.items.findIndex((task) => task.id === id);
        this._model.setProperty(`/items/${taskIndex}/status`, status);
    }

    // hook for adding task. the most convenient thing would be to simply `push` but modifyin the reference requires `updateBindings`. its acceptable to do it, since `adding` might be considered "a bigger operation"
    public addTask(task: TaskItem) {
        this._data.items.push(task);
        this._model.updateBindings(true);
    }
}
```

We've added a way to access the typed data & to register the model as soon as the adapter is created. The other methods are the mutators previously mentioned. Once added, model usage should happen through `TaskStateService` exclusively, in order to enjoy the benefits explained above.

### Making it usable

We can improve our adapter a bit further. Right now, its a bit cluttered - `register`, `get _data` should not really convolute our model API definition. Furthermore, "reading" / accessing data through `_data` is indeed ugly and poses another danger. Have you ever written `if(myVar = VALUE_TO_CHECK_AGAINST)`? Its not cool.

Lets add the following 2 improvements to address these additional issues:

1. We can add a base class, from which our `TaskStateService` will inherit, where we can put all methods not relevant to the object we are writing the adapter for.
2. We can leverage TypeScript to expose a "readonly" or "non-mutable" data reference to the model's data for all the cases where we would only want read access.

```typescript
// model/State.service.ts
// Make the base class generic, so inherited methods are aware of the data type stored in the JSONModel. Additionally, the base class can't be instantiated, so it must be generic.
export abstract class StateService<T extends object> {
    // Store reference to the `JSONModel`
    protected readonly _model: JSONModel;

    // Store reference to & initialize `JSONModel` on adapter initialization
    constructor(modelName: string, data: T) {
        this._model = new JSONModel(data);
        this.register(modelName);
    }

    // Mutable data reference hook for internal use inside state service classes
    protected get _data(): T {
        return <T>this._model.getData();
    }

    // Non-mutable readonly data reference hook for publi access to our model
    public get state(): DeepReadonly<T> {
        return <DeepReadonly<T>>this._data;
    }

    // Utility hook for registering our model
    private register(modelName: string) {
        Component.getComponentById(
            'com.github.dfenerski.native_state.Component',
        ).setModel(this._model, modelName);
    }

    // Generic setter for convenience
    protected set(dataLike: DeepPartial<T>): void {
        this._model.setData(dataLike, true);
    }
}
```

The utility types `DeepReadonly` & `DeepPartial` can be found in `/webapp/types`. Otherwise the base class looks sensible. Lets re-do our concrete `TaskStateService`, this time inheriting all the good stuff from the base class:

```typescript
// model/task/TaskState.service.ts
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
```

Look at that! All the setters are strongly typed, well defined & there is no way we mistype a model property path again. Updates against mutable model reference are also fine, we can call `updateBindings` whenever justified. Furthermore, all of the state logic is contained. This greatly decreases the risk of typos with `setProperty` & lavish `updateBindings` misuse.

### Exposing `TaskStateService` to the app

One more thing is required before we can use the adapter: we have to initialize & export it. For simplicity, in this demo this is done through the export facade. _In some later samples, we can take a look at better ways to do this._

```typescript
// model/task/TaskStateService

// ... previous logic

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
```

As soon as the import is made, the file contents will be evaluated & adapter instantiation will be made. However we do `Component.setModel` in our constructor, which means the `Component` must be available. This issue can be alleviated later, but for now, we can simply do anonymous import for the models in our main controller

```typescript
// controller/App.controller.ts
import '../model/task/TaskState.service';
```

Finally, we can use the adapters we defined:

```typescript
// controller/Main.controller.ts

/**
 * @namespace com.github.dfenerski.native_state.controller
 */
export default class Main extends BaseController {
    private readonly taskModel = TaskStateService;

    // TaskItemFactory can be anything that returns valid `TaskItems`
    public handleNewTaskRequest(): void {
        // typed setter
        this.taskModel.setSelectedTask(TaskItemFactory.createEmptyTaskItem());
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
        // typed setter!
        this.taskModel.setTaskPriority(taskId, taskPrio + prioDelta);
    }

    public demoHandler() {
        if ((this.taskModel.state.selectedItem.title = 'Foo')) {
            // error! the public read api (`.state`) returns a readonly reference to the data. only setters can mutate
            // ...
        }
    }
}
```

# Conclusion

We've shown a way to manage state using TypeScript & ES classes only - zero dependencies were needed. We've exposed type-safe "read" access & strongly typed model setters for any mutations we might need to run. This pattern can be greatly expanded, but its performance limits are the performance limits of `JSONModel` itself. We've delegated as much as possible to the framework itself, while building a nice API for ourselves.

As mentioned, some things may be missing. In any case, please try the app / the pattern for yourself. The app was generated using `yo easy-ui5 ts-app` so a `npm install && npm run start` should spin up an instance for you.

Please feel free to open issues or submit PRs.

## License

This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSE) file.
