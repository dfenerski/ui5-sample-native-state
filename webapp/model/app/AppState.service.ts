import { StateService } from '../State.service';
import { App } from './App';

class AppStateService extends StateService<App> {
    public setLayout(layout: App['layout']) {
        this._model.setProperty('/layout', layout);
    }
}

const appModel = new AppStateService('app', new App());

export { appModel as AppStateService };
