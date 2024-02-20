import { StateService } from '../State.service';
import { App } from './App';

class AppStateService extends StateService<App> {}

const appModel = new AppStateService('app', new App());

export { appModel as AppStateService };
