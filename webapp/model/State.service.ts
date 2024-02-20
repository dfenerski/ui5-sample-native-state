import Component from 'sap/ui/core/Component';
import JSONModel from 'sap/ui/model/json/JSONModel';
import { DeepPartial } from '../types/DeepPartial';
import { DeepReadonly } from '../types/DeepReadonly';

export class StateService<T extends object> {
    private readonly _model: JSONModel;

    constructor(modelName: string, data: T) {
        this._model = new JSONModel(data);
        this.register(modelName);
    }

    public get state(): DeepReadonly<T> {
        return <DeepReadonly<T>>this._model.getData();
    }

    private register(modelName: string) {
        Component.getComponentById(
            'com.github.dfenerski.native_state.Component',
        ).setModel(this._model, modelName);
    }

    protected set(dataLike: DeepPartial<T>): void {
        this._model.setData(dataLike, true);
    }
}
